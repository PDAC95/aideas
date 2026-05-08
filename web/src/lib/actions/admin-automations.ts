"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import {
  transitionAutomationSchema,
  type TransitionAutomationInput,
} from "@/lib/validations/admin-automation";

export type TransitionResult =
  | { ok: true; newStatus: "active" | "paused" | "archived" }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "state_changed"
        | "update_failed";
    };

/**
 * Best-effort notification fan-out. Duplicated from admin-requests.ts so the
 * two action modules remain independent (admin-requests can evolve its copy /
 * type / link rules without affecting admin-automations). Both helpers swallow
 * errors and log a warning — the transition succeeds even if every notification
 * insert fails.
 */
async function notifyOrgMembers(args: {
  supabase: Awaited<ReturnType<typeof createAdminServerClient>>;
  organizationId: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  link: string | null;
}): Promise<void> {
  const { supabase, organizationId, type, title, message, link } = args;

  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (membersError) {
    console.warn("[admin-automations:notifyOrgMembers] members_lookup_failed", {
      organizationId,
      error: membersError,
    });
    return;
  }

  const userIds = (members ?? [])
    .map((m: { user_id: string }) => m.user_id)
    .filter(Boolean);
  if (userIds.length === 0) {
    console.warn("[admin-automations:notifyOrgMembers] no_active_members", {
      organizationId,
    });
    return;
  }

  const rows = userIds.map((user_id) => ({
    organization_id: organizationId,
    user_id,
    type,
    title,
    message,
    link,
  }));
  const { error: insertError } = await supabase
    .from("notifications")
    .insert(rows);
  if (insertError) {
    console.warn("[admin-automations:notifyOrgMembers] insert_failed", {
      organizationId,
      count: rows.length,
      error: insertError,
    });
  }
}

/**
 * Shared transition primitive. Implements the race-condition + revalidate +
 * notification fan-out pattern. The four exported actions wrap this with
 * their specific from/to/notification-copy.
 *
 * @param expectedFromStatuses Real DB status the row MUST currently have. Race guard.
 * @param toStatus    The new status to write.
 * @param notification How to render the customer-facing notification copy.
 */
async function doTransition(args: {
  input: TransitionAutomationInput;
  expectedFromStatuses: ReadonlyArray<"in_setup" | "active" | "paused">;
  toStatus: "active" | "paused" | "archived";
  notification: {
    type: "info" | "success" | "warning";
    titleTemplate: string; // English title, MAY include {name}
    messageTemplate: string; // English message, MAY include {name}
  };
}): Promise<TransitionResult> {
  const parsed = transitionAutomationSchema.safeParse(args.input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  // The action layer also enforces that the client's expected_status is one
  // we accept for THIS specific transition (e.g. activateAutomation rejects
  // if expected_status='paused'). Belt-and-braces with Zod's enum.
  if (
    !args.expectedFromStatuses.includes(
      parsed.data.expectedStatus as "in_setup" | "active" | "paused"
    )
  ) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { automationId, expectedStatus } = parsed.data;

  // Pre-flight: load row + status check.
  const { data: row, error: rowError } = await supabase
    .from("automations")
    .select("id, name, organization_id, status")
    .eq("id", automationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (rowError) {
    console.error("[admin-automations] lookup_failed", {
      automationId,
      error: rowError,
    });
    return { ok: false, error: "update_failed" };
  }
  if (!row) return { ok: false, error: "not_found" };
  if (row.status !== expectedStatus)
    return { ok: false, error: "state_changed" };

  // UPDATE with second race guard at SQL layer.
  const { error: updateError } = await supabase
    .from("automations")
    .update({ status: args.toStatus })
    .eq("id", automationId)
    .eq("status", expectedStatus);
  if (updateError) {
    console.error("[admin-automations] update_failed", {
      automationId,
      expectedStatus,
      toStatus: args.toStatus,
      error: updateError,
    });
    return { ok: false, error: "update_failed" };
  }

  // Best-effort notification fan-out. Render templates with the automation name.
  const title = args.notification.titleTemplate.replace("{name}", row.name);
  const message = args.notification.messageTemplate.replace("{name}", row.name);
  await notifyOrgMembers({
    supabase,
    organizationId: row.organization_id,
    type: args.notification.type,
    title,
    message,
    link: "/dashboard/automations",
  });

  // Revalidate admin + customer paths so SSR pages and Realtime subscribers
  // pick up the change.
  revalidatePath("/admin/automations");
  revalidatePath(`/admin/automations/${automationId}`);
  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard/notifications");

  return { ok: true, newStatus: args.toStatus };
}

/**
 * in_setup -> active.
 * Notification: success type, "Your automation '{name}' is now active".
 */
export async function activateAutomation(
  input: TransitionAutomationInput
): Promise<TransitionResult> {
  return doTransition({
    input,
    expectedFromStatuses: ["in_setup"],
    toStatus: "active",
    notification: {
      type: "success",
      titleTemplate: "Automation activated",
      messageTemplate: 'Your automation "{name}" is now active',
    },
  });
}

/**
 * active -> paused.
 * Notification: info type, "Your automation '{name}' has been paused".
 */
export async function pauseAutomation(
  input: TransitionAutomationInput
): Promise<TransitionResult> {
  return doTransition({
    input,
    expectedFromStatuses: ["active"],
    toStatus: "paused",
    notification: {
      type: "info",
      titleTemplate: "Automation paused",
      messageTemplate: 'Your automation "{name}" has been paused',
    },
  });
}

/**
 * paused -> active.
 * Notification: success type, "Your automation '{name}' has been resumed".
 */
export async function resumeAutomation(
  input: TransitionAutomationInput
): Promise<TransitionResult> {
  return doTransition({
    input,
    expectedFromStatuses: ["paused"],
    toStatus: "active",
    notification: {
      type: "success",
      titleTemplate: "Automation resumed",
      messageTemplate: 'Your automation "{name}" has been resumed',
    },
  });
}

/**
 * active|paused -> archived. Either expected_status is acceptable; the action
 * looks at the input's expectedStatus to choose the SQL guard, but accepts
 * both as valid starting points.
 *
 * Notification: info type, "Your automation '{name}' has been archived".
 */
export async function archiveAutomation(
  input: TransitionAutomationInput
): Promise<TransitionResult> {
  return doTransition({
    input,
    expectedFromStatuses: ["active", "paused"],
    toStatus: "archived",
    notification: {
      type: "info",
      titleTemplate: "Automation archived",
      messageTemplate: 'Your automation "{name}" has been archived',
    },
  });
}
