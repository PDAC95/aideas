"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { assertOrgMembership } from "@/lib/auth/assert-org-membership";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function updateAutomationStatus(
  automationId: string,
  newStatus: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  // 1. Look up the automation's org (anon client — RLS allows org members to read their own automations).
  const { data: automation, error: fetchError } = await supabase
    .from("automations")
    .select("organization_id")
    .eq("id", automationId)
    .single();

  // Treat "not found" identically to "forbidden" — generic error, no resource-existence oracle.
  if (fetchError || !automation) {
    console.error("[updateAutomationStatus] automation not found or read denied", {
      automationId,
    });
    return { error: "forbidden" };
  }

  // 2. Assert membership (owner | admin | operator). Viewer is rejected.
  const denied = await assertOrgMembership(
    supabase,
    automation.organization_id,
    ["owner", "admin", "operator"]
  );
  if (denied) {
    console.error("[updateAutomationStatus] access denied", {
      automationId,
      attemptedOrgId: automation.organization_id,
    });
    return denied;
  }

  // 3. Perform the write via admin client — automations writes are service_role only.
  const admin = getAdminClient();
  const { error } = await admin
    .from("automations")
    .update({ status: newStatus })
    .eq("id", automationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/automations");
  revalidatePath(`/dashboard/automations/${automationId}`);
  return { success: true };
}
