"use server";

import { redirect } from "next/navigation";
import { createAdminServerClient } from "@/lib/supabase/admin-server";

/**
 * Sign in a platform staff member using the admin-scoped cookie set.
 *
 * Returns `{ error }` on failure (caller surfaces it in the form).
 * On success, redirects to `/admin` (throws a NEXT_REDIRECT — does not return).
 *
 * Double-checks platform_staff membership and signs out non-staff users so
 * they cannot leave a stray admin session in their browser.
 */
export async function signInStaff(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createAdminServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { error: "Invalid credentials." };
  }

  const { data: staff } = await supabase
    .from("platform_staff")
    .select("user_id")
    .eq("user_id", data.user.id)
    .single();

  if (!staff) {
    await supabase.auth.signOut();
    return { error: "This account is not registered as platform staff." };
  }

  redirect("/admin");
}

/**
 * Sign out a platform staff member from the admin-scoped cookie set.
 * Does NOT touch the customer (`sb-*`) session.
 */
export async function signOutStaff() {
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
