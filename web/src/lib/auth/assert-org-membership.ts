import type { SupabaseClient } from "@supabase/supabase-js";

type OrgRole = "owner" | "admin" | "operator" | "viewer";

const DEFAULT_ALLOWED_ROLES: OrgRole[] = ["owner", "admin", "operator"];

/**
 * Verifies the authenticated user is an active member of `orgId` with one of `allowedRoles`.
 * Returns { error: "forbidden" } | { error: "unauthorized" } on failure, null on success.
 * Uses generic error messages to avoid resource-existence oracle.
 *
 * Caller passes the supabase cookie client so the same session is reused (do NOT create a new client here).
 *
 * Logs structured `console.error` on rejection with userId + attemptedOrgId. The caller is responsible
 * for adding any extra context (e.g., automationId) at its own log line.
 */
export async function assertOrgMembership(
  supabase: SupabaseClient,
  orgId: string,
  allowedRoles: OrgRole[] = DEFAULT_ALLOWED_ROLES
): Promise<{ error: string } | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[assertOrgMembership] unauthorized — no user", {
      attemptedOrgId: orgId,
    });
    return { error: "unauthorized" };
  }

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .single();

  if (!member || !allowedRoles.includes(member.role as OrgRole)) {
    console.error("[assertOrgMembership] access denied", {
      userId: user.id,
      attemptedOrgId: orgId,
    });
    return { error: "forbidden" };
  }

  return null;
}
