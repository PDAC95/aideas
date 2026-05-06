"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import {
  adminCatalogTemplateActiveSchema,
  adminCatalogTemplateBaseSchema,
  type AdminCatalogTemplateInput,
} from "@/lib/validations/admin-catalog-template";

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

// Loose UUID-shape regex (8-4-4-4-12 hex). The seed uses custom non-RFC
// UUIDs like "ee030100-0000-0000-0000-000000000001" for readability, which
// Zod v4's strict uuid() rejects (requires version digit 1-8). IDs come
// from the DB, not user input — shape validation is sufficient.
const uuidShape = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid id"
);

const toggleActiveSchema = z.object({
  templateId: uuidShape,
  nextActive: z.boolean(),
});

const toggleFeaturedSchema = z.object({
  templateId: uuidShape,
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
    console.error("[toggleTemplateActive] invalid_input", { input, issues: parsed.error.issues });
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

// ---------------------------------------------------------------------------
// Create / Update — Plan 18-03
// ---------------------------------------------------------------------------

export type CreateTemplateResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "slug_taken"
        | "not_authenticated"
        | "not_staff"
        | "create_failed";
      fieldErrors?: Record<string, string>;
    };

export type UpdateTemplateResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_found"
        | "not_authenticated"
        | "not_staff"
        | "update_failed";
      fieldErrors?: Record<string, string>;
    };

const TRANSLATION_LOCALES = ["en", "es"] as const;
const TRANSLATION_FIELDS = [
  "name",
  "description",
  "typical_impact_text",
  "activity_metric_label",
] as const;

/**
 * Build the 8 translation rows for a template from a flat input shape.
 * Output is the wire shape the translations table expects.
 */
function buildTranslationRows(
  templateId: string,
  input: AdminCatalogTemplateInput
): Array<{
  template_id: string;
  locale: "en" | "es";
  field: (typeof TRANSLATION_FIELDS)[number];
  value: string;
}> {
  const rows: Array<{
    template_id: string;
    locale: "en" | "es";
    field: (typeof TRANSLATION_FIELDS)[number];
    value: string;
  }> = [];
  for (const locale of TRANSLATION_LOCALES) {
    for (const field of TRANSLATION_FIELDS) {
      const key = `${field}_${locale}` as keyof AdminCatalogTemplateInput;
      const raw = input[key];
      const value = typeof raw === "string" ? raw : "";
      rows.push({ template_id: templateId, locale, field, value });
    }
  }
  return rows;
}

/**
 * Flatten Zod issues into a `{ fieldName: message }` map. The first issue
 * per path wins so the UI can show one message per field; the rest are
 * available via formState.errors for completeness.
 */
function flattenZodIssues(issues: z.ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    if (path && !(path in out)) {
      out[path] = issue.message;
    }
  }
  return out;
}

/**
 * Build the legacy i18n key shape used by `automation_templates.name`
 * for backward compatibility with any unmigrated reader. Slug `lead-followup`
 * becomes `templates.lead_followup.name`.
 */
function legacyKeyForSlug(slug: string, suffix: string): string {
  return `templates.${slug.replaceAll("-", "_")}.${suffix}`;
}

/**
 * Create a new automation_template row + 8 translation rows atomically.
 *
 * Steps:
 * 1. assertPlatformStaff
 * 2. Pick schema based on is_active and validate input.
 * 3. Pre-flight slug uniqueness (a unique constraint exists on the column;
 *    this pre-flight gives a clean error code without parsing PG codes).
 * 4. INSERT into automation_templates (legacy text columns mirror EN values).
 * 5. INSERT 8 rows into automation_template_translations.
 * 6. On translation failure: DELETE the just-created template row to avoid
 *    orphaning the legacy columns at a different state than translations.
 * 7. revalidatePath both admin and customer catalog routes.
 */
export async function createTemplate(
  input: AdminCatalogTemplateInput
): Promise<CreateTemplateResult> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated") {
      return { ok: false, error: "not_authenticated" };
    }
    return { ok: false, error: "not_staff" };
  }

  const schema = input.is_active
    ? adminCatalogTemplateActiveSchema
    : adminCatalogTemplateBaseSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: flattenZodIssues(parsed.error.issues),
    };
  }
  const data = parsed.data;

  // Pre-flight uniqueness check.
  const { data: existing, error: existingError } = await supabase
    .from("automation_templates")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle();
  if (existingError) {
    console.error("[createTemplate] slug_check_failed", { error: existingError });
    return { ok: false, error: "create_failed" };
  }
  if (existing) {
    return {
      ok: false,
      error: "slug_taken",
      fieldErrors: { slug: "slug_taken" },
    };
  }

  // Insert the template row. Legacy text columns mirror EN values so any
  // unmigrated reader keeps working; the customer query layer reads from
  // automation_template_translations.
  const insertRow = {
    name: legacyKeyForSlug(data.slug, "name"),
    slug: data.slug,
    description: data.description_en,
    category: data.category,
    icon: data.icon ?? null,
    pricing_tier: data.pricing_tier,
    is_active: data.is_active,
    is_featured: data.is_featured,
    sort_order: data.sort_order,
    setup_price: data.setup_price,
    monthly_price: data.monthly_price,
    setup_time_days: data.setup_time_days,
    industry_tags: data.industry_tags,
    connected_apps: data.connected_apps,
    typical_impact_text: data.typical_impact_text_en,
    avg_minutes_per_task: data.avg_minutes_per_task,
    activity_metric_label: data.activity_metric_label_en,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("automation_templates")
    .insert(insertRow)
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[createTemplate] template_insert_failed", { error: insertError });
    return { ok: false, error: "create_failed" };
  }

  const newId = inserted.id as string;

  // Insert 8 translation rows. On failure, roll back the template insert.
  const translationRows = buildTranslationRows(newId, data);
  const { error: translationsError } = await supabase
    .from("automation_template_translations")
    .insert(translationRows);

  if (translationsError) {
    console.error("[createTemplate] translations_insert_failed", {
      error: translationsError,
      templateId: newId,
    });
    // Rollback: delete the orphan template row.
    const { error: deleteError } = await supabase
      .from("automation_templates")
      .delete()
      .eq("id", newId);
    if (deleteError) {
      console.error("[createTemplate] rollback_failed", {
        error: deleteError,
        templateId: newId,
      });
    }
    return { ok: false, error: "create_failed" };
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/dashboard/catalog");
  return { ok: true, slug: data.slug };
}

/**
 * Update an existing template by slug. Slug itself is locked (per CONTEXT)
 * and is NOT changed by this action.
 *
 * Steps:
 * 1. assertPlatformStaff
 * 2. Validate input (active mode if is_active=true).
 * 3. Look up template by slug; fail with not_found if missing.
 * 4. UPDATE the templates row (legacy text columns sync to EN values).
 * 5. UPSERT 8 translation rows on (template_id, locale, field).
 * 6. revalidatePath admin and customer routes plus this edit page.
 */
export async function updateTemplate(
  slug: string,
  input: AdminCatalogTemplateInput
): Promise<UpdateTemplateResult> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated") {
      return { ok: false, error: "not_authenticated" };
    }
    return { ok: false, error: "not_staff" };
  }

  const schema = input.is_active
    ? adminCatalogTemplateActiveSchema
    : adminCatalogTemplateBaseSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldErrors: flattenZodIssues(parsed.error.issues),
    };
  }
  const data = parsed.data;

  const { data: existing, error: lookupError } = await supabase
    .from("automation_templates")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) {
    console.error("[updateTemplate] lookup_failed", { error: lookupError });
    return { ok: false, error: "update_failed" };
  }
  if (!existing) {
    return { ok: false, error: "not_found" };
  }

  const templateId = existing.id as string;

  // Update mutable columns. Slug is intentionally NOT in the update payload.
  const updateRow = {
    name: legacyKeyForSlug(slug, "name"),
    description: data.description_en,
    category: data.category,
    icon: data.icon ?? null,
    pricing_tier: data.pricing_tier,
    is_active: data.is_active,
    is_featured: data.is_featured,
    sort_order: data.sort_order,
    setup_price: data.setup_price,
    monthly_price: data.monthly_price,
    setup_time_days: data.setup_time_days,
    industry_tags: data.industry_tags,
    connected_apps: data.connected_apps,
    typical_impact_text: data.typical_impact_text_en,
    avg_minutes_per_task: data.avg_minutes_per_task,
    activity_metric_label: data.activity_metric_label_en,
  };

  const { error: updateError } = await supabase
    .from("automation_templates")
    .update(updateRow)
    .eq("id", templateId);

  if (updateError) {
    console.error("[updateTemplate] update_failed", { error: updateError });
    return { ok: false, error: "update_failed" };
  }

  // Upsert all 8 translation rows. PG conflict target matches the PK on the
  // table: (template_id, locale, field).
  const translationRows = buildTranslationRows(templateId, data);
  const { error: translationsError } = await supabase
    .from("automation_template_translations")
    .upsert(translationRows, { onConflict: "template_id,locale,field" });

  if (translationsError) {
    console.error("[updateTemplate] translations_upsert_failed", {
      error: translationsError,
      templateId,
    });
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/dashboard/catalog");
  revalidatePath(`/admin/catalog/${slug}/edit`);
  return { ok: true };
}
