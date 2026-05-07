"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import {
  approveRequestSchema,
  rejectRequestSchema,
  type ApproveRequestInput,
  type RejectRequestInput,
} from "@/lib/validations/admin-request";

export type ApproveResult =
  | { ok: true; automationId: string }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "state_changed"
        | "create_failed";
    };

export type RejectResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "state_changed"
        | "update_failed";
      fieldError?: "reason_too_short" | "reason_too_long";
    };

/**
 * Helper: best-effort notification fan-out to all active members of an org.
 * Logs and swallows errors per CONTEXT.md ("if notification insert fails,
 * approve still succeeds — log warning, don't block").
 */
async function notifyOrgMembers(args: {
  supabase: Awaited<ReturnType<typeof createAdminServerClient>>;
  organizationId: string;
  type: "success" | "warning";
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
    console.warn("[notifyOrgMembers] members_lookup_failed", {
      organizationId,
      error: membersError,
    });
    return;
  }

  const userIds = (members ?? [])
    .map((m: { user_id: string }) => m.user_id)
    .filter(Boolean);

  if (userIds.length === 0) {
    console.warn("[notifyOrgMembers] no_active_members", { organizationId });
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
    console.warn("[notifyOrgMembers] insert_failed", {
      organizationId,
      count: rows.length,
      error: insertError,
    });
  }
}

/**
 * Approve a PENDING automation_request.
 *
 * Steps:
 *   1. assertPlatformStaff
 *   2. Validate input
 *   3. SELECT request including status, organization_id, template_id, description, title
 *   4. If status != 'pending' -> return state_changed (race-condition guard)
 *   5. SELECT template name (best-effort, for the new automation's name + notification copy)
 *   6. INSERT new automations row (status='in_setup', name="{Template} for {Org}", setup_notes=request.description)
 *   7. UPDATE request to status='approved', completed_at=now (with .eq('status','pending') as second race guard)
 *   8. Best-effort notification fan-out
 *   9. revalidatePath both admin list/detail and customer notifications
 *
 * NOTE: Supabase JS lacks cross-table transactions. If the request UPDATE
 * fails AFTER the automation INSERT succeeds, we end up with an in_setup
 * automation but a still-pending request. That's recoverable from the admin
 * UI (operator can archive the orphan automation). The opposite ordering
 * (UPDATE first, INSERT second) leaves the request marked approved with no
 * automation — worse, because the customer sees "approved" but nothing is
 * being worked on. So: INSERT first, UPDATE second.
 */
export async function approveRequest(
  input: ApproveRequestInput
): Promise<ApproveResult> {
  const parsed = approveRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { requestId } = parsed.data;

  // Pre-flight: load request with status check.
  const { data: req, error: reqError } = await supabase
    .from("automation_requests")
    .select("id, organization_id, template_id, title, description, status")
    .eq("id", requestId)
    .is("deleted_at", null)
    .maybeSingle();

  if (reqError) {
    console.error("[approveRequest] lookup_failed", {
      requestId,
      error: reqError,
    });
    return { ok: false, error: "create_failed" };
  }
  if (!req) return { ok: false, error: "not_found" };
  if (req.status !== "pending") return { ok: false, error: "state_changed" };

  // Best-effort: resolve template + org names for the new automation.name
  // and notification copy.
  let templateName = req.title;
  if (req.template_id) {
    const { data: tmplName } = await supabase
      .from("automation_template_translations")
      .select("value")
      .eq("template_id", req.template_id)
      .eq("locale", "en")
      .eq("field", "name")
      .maybeSingle();
    if (tmplName?.value) templateName = tmplName.value;
  }

  let orgName = "your organization";
  {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", req.organization_id)
      .maybeSingle();
    if (org?.name) orgName = org.name;
  }

  // Insert new automation.
  const { data: inserted, error: insertError } = await supabase
    .from("automations")
    .insert({
      organization_id: req.organization_id,
      template_id: req.template_id, // may be null for custom requests
      name: `${templateName} for ${orgName}`,
      description: req.description, // also store on description for backward compat
      status: "in_setup",
      setup_notes: req.description,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[approveRequest] automation_insert_failed", {
      requestId,
      error: insertError,
    });
    return { ok: false, error: "create_failed" };
  }

  // Flip request to approved, with a second race-guard at the SQL layer.
  const { error: updateError } = await supabase
    .from("automation_requests")
    .update({
      status: "approved",
      completed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (updateError) {
    console.error("[approveRequest] request_update_failed", {
      requestId,
      automationId: inserted.id,
      error: updateError,
    });
    // Soft-fail: we created the automation but couldn't flip the request.
    // Return create_failed so the UI surfaces an error; an operator can
    // archive the orphan via Phase 20 if needed.
    return { ok: false, error: "create_failed" };
  }

  // Best-effort customer notification.
  await notifyOrgMembers({
    supabase,
    organizationId: req.organization_id,
    type: "success",
    title: `Request approved`,
    message: `Your request "${templateName}" has been approved and is now in setup.`,
    link: "/dashboard/automations",
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/automations");

  return { ok: true, automationId: inserted.id };
}

/**
 * Reject a PENDING automation_request.
 *
 * Steps:
 *   1. assertPlatformStaff
 *   2. Validate input (Zod will trim and enforce 10..500 char reason)
 *   3. SELECT request status (race guard — must be 'pending')
 *   4. UPDATE request -> status='rejected', notes=reason, completed_at=now
 *   5. Best-effort notification fan-out (type='warning', message includes reason verbatim)
 *   6. revalidatePath
 */
export async function rejectRequest(
  input: RejectRequestInput
): Promise<RejectResult> {
  const parsed = rejectRequestSchema.safeParse(input);
  if (!parsed.success) {
    const firstReasonIssue = parsed.error.issues.find(
      (i) => i.path[0] === "reason"
    );
    if (firstReasonIssue) {
      const code = firstReasonIssue.message;
      if (code === "reason_too_short" || code === "reason_too_long") {
        return { ok: false, error: "invalid_input", fieldError: code };
      }
    }
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { requestId, reason } = parsed.data;

  const { data: req, error: reqError } = await supabase
    .from("automation_requests")
    .select("id, organization_id, template_id, title, status")
    .eq("id", requestId)
    .is("deleted_at", null)
    .maybeSingle();

  if (reqError) {
    console.error("[rejectRequest] lookup_failed", {
      requestId,
      error: reqError,
    });
    return { ok: false, error: "update_failed" };
  }
  if (!req) return { ok: false, error: "not_found" };
  if (req.status !== "pending") return { ok: false, error: "state_changed" };

  // Resolve template name for notification copy.
  let templateName = req.title;
  if (req.template_id) {
    const { data: tmplName } = await supabase
      .from("automation_template_translations")
      .select("value")
      .eq("template_id", req.template_id)
      .eq("locale", "en")
      .eq("field", "name")
      .maybeSingle();
    if (tmplName?.value) templateName = tmplName.value;
  }

  const { error: updateError } = await supabase
    .from("automation_requests")
    .update({
      status: "rejected",
      notes: reason,
      completed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (updateError) {
    console.error("[rejectRequest] update_failed", {
      requestId,
      error: updateError,
    });
    return { ok: false, error: "update_failed" };
  }

  await notifyOrgMembers({
    supabase,
    organizationId: req.organization_id,
    type: "warning",
    title: `Request rejected`,
    message: `Your request "${templateName}" was rejected: ${reason}`,
    link: "/dashboard/automations",
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/dashboard/notifications");

  return { ok: true };
}
