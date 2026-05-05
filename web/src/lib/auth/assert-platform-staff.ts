import type { SupabaseClient } from "@supabase/supabase-js";

export type StaffRole = "super_admin" | "operator";

export type AssertPlatformStaffResult =
  | { ok: true; userId: string; role: StaffRole }
  | { ok: false; error: "not_authenticated" }
  | { ok: false; error: "not_staff" }
  | { ok: false; error: "insufficient_role" };

/**
 * Verifies the authenticated caller is in `platform_staff`.
 *
 * Caller passes an admin-scoped Supabase client (createAdminServerClient())
 * so the same admin session is reused (do NOT create a new client here).
 *
 * @param supabase - admin-scoped Supabase client
 * @param requiredRole - if provided, caller must have exactly this role
 *
 * Returns `{ ok: true, userId, role }` on success, or
 * `{ ok: false, error }` with a typed error otherwise.
 *
 * Logs structured `console.error` on rejection for observability.
 */
export async function assertPlatformStaff(
  supabase: SupabaseClient,
  requiredRole?: StaffRole
): Promise<AssertPlatformStaffResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[assertPlatformStaff] not_authenticated");
    return { ok: false, error: "not_authenticated" };
  }

  const { data: staff } = await supabase
    .from("platform_staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!staff) {
    console.error("[assertPlatformStaff] not_staff", { userId: user.id });
    return { ok: false, error: "not_staff" };
  }

  const role = staff.role as StaffRole;
  if (requiredRole && role !== requiredRole) {
    console.error("[assertPlatformStaff] insufficient_role", {
      userId: user.id,
      have: role,
      need: requiredRole,
    });
    return { ok: false, error: "insufficient_role" };
  }

  return { ok: true, userId: user.id, role };
}
