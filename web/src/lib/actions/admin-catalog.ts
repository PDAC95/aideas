"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";

/**
 * Toggle outcomes used by both server actions. Errors map onto a small,
 * client-friendly union so the UI can localize messages without leaking
 * Supabase internals.
 */
export type ToggleResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid_input" | "not_authenticated" | "not_staff" | "update_failed";
    };

const toggleActiveSchema = z.object({
  templateId: z.string().uuid(),
  nextActive: z.boolean(),
});

const toggleFeaturedSchema = z.object({
  templateId: z.string().uuid(),
  nextFeatured: z.boolean(),
});

/**
 * Flip `is_active` on a template. Both directions allowed by design.
 *
 * Deactivation warning UX is enforced client-side; this action accepts the
 * flip either way so a malicious client cannot cause data corruption by
 * skipping the modal — they just deactivate, which is already the intended
 * end state.
 *
 * On success, revalidates both /admin/catalog and /dashboard/catalog so the
 * customer-facing list reflects the change on its next request without a
 * redeploy.
 */
export async function toggleTemplateActive(input: {
  templateId: string;
  nextActive: boolean;
}): Promise<ToggleResult> {
  const parsed = toggleActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated") return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { error } = await supabase
    .from("automation_templates")
    .update({ is_active: parsed.data.nextActive })
    .eq("id", parsed.data.templateId);

  if (error) {
    console.error("[toggleTemplateActive] update_failed", { error });
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/dashboard/catalog");
  return { ok: true };
}

/**
 * Flip `is_featured` on a template. No warn-modal needed; the customer
 * "Mas populares" tab simply gains or loses a card on next reload.
 */
export async function toggleTemplateFeatured(input: {
  templateId: string;
  nextFeatured: boolean;
}): Promise<ToggleResult> {
  const parsed = toggleFeaturedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated") return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { error } = await supabase
    .from("automation_templates")
    .update({ is_featured: parsed.data.nextFeatured })
    .eq("id", parsed.data.templateId);

  if (error) {
    console.error("[toggleTemplateFeatured] update_failed", { error });
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/dashboard/catalog");
  return { ok: true };
}
