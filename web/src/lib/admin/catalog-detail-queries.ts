import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";

/**
 * Shape returned to the edit page. Mirrors the template row plus a flat
 * `translations` object keyed by `${field}_${locale}` so the form can
 * spread it into its initial values without further mapping.
 */
export interface AdminTemplateForEdit {
  template: {
    id: string;
    slug: string;
    category: string;
    icon: string | null;
    pricing_tier: string;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    setup_price: number | null;
    monthly_price: number | null;
    setup_time_days: number | null;
    industry_tags: string[];
    connected_apps: string[];
    avg_minutes_per_task: number | null;
  };
  translations: {
    name_en: string;
    name_es: string;
    description_en: string;
    description_es: string;
    typical_impact_text_en: string;
    typical_impact_text_es: string;
    activity_metric_label_en: string;
    activity_metric_label_es: string;
  };
}

const TRANSLATION_FIELDS = [
  "name",
  "description",
  "typical_impact_text",
  "activity_metric_label",
] as const;

const TRANSLATION_LOCALES = ["en", "es"] as const;

type TranslationField = (typeof TRANSLATION_FIELDS)[number];
type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/**
 * Fetch a single template plus all 8 translation rows for the admin edit page.
 *
 * Returns null when no template exists at the given slug; the caller (page)
 * is expected to call notFound() in that case.
 *
 * Throws when the caller is not platform staff. The (admin) layout already
 * gates the route, so reaching this query without staff is a hard error.
 */
export async function fetchAdminTemplateForEdit(
  slug: string
): Promise<AdminTemplateForEdit | null> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminTemplateForEdit: not authorized (${auth.error})`);
  }

  const { data: templateRow, error: templateError } = await supabase
    .from("automation_templates")
    .select(
      `
      id, slug, category, icon, pricing_tier,
      is_active, is_featured, sort_order,
      setup_price, monthly_price, setup_time_days,
      industry_tags, connected_apps,
      avg_minutes_per_task
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (templateError) throw templateError;
  if (!templateRow) return null;

  const templateId = templateRow.id as string;

  const { data: translationRows, error: translationsError } = await supabase
    .from("automation_template_translations")
    .select("locale, field, value")
    .eq("template_id", templateId);

  if (translationsError) throw translationsError;

  // Build the flat { field_locale: value } object. Defaults to empty string
  // so missing rows don't break the edit form.
  const flat: AdminTemplateForEdit["translations"] = {
    name_en: "",
    name_es: "",
    description_en: "",
    description_es: "",
    typical_impact_text_en: "",
    typical_impact_text_es: "",
    activity_metric_label_en: "",
    activity_metric_label_es: "",
  };

  type Row = { locale: string; field: string; value: string | null };
  for (const row of (translationRows ?? []) as Row[]) {
    const locale = row.locale as TranslationLocale;
    const field = row.field as TranslationField;
    if (!TRANSLATION_LOCALES.includes(locale)) continue;
    if (!TRANSLATION_FIELDS.includes(field)) continue;
    const key = `${field}_${locale}` as keyof AdminTemplateForEdit["translations"];
    flat[key] = row.value ?? "";
  }

  return {
    template: {
      id: templateRow.id as string,
      slug: templateRow.slug as string,
      category: templateRow.category as string,
      icon: (templateRow.icon as string | null) ?? null,
      pricing_tier: templateRow.pricing_tier as string,
      is_active: templateRow.is_active as boolean,
      is_featured: templateRow.is_featured as boolean,
      sort_order: (templateRow.sort_order as number | null) ?? 0,
      setup_price: (templateRow.setup_price as number | null) ?? null,
      monthly_price: (templateRow.monthly_price as number | null) ?? null,
      setup_time_days: (templateRow.setup_time_days as number | null) ?? null,
      industry_tags: ((templateRow.industry_tags as string[] | null) ?? []) as string[],
      connected_apps: ((templateRow.connected_apps as string[] | null) ?? []) as string[],
      avg_minutes_per_task:
        (templateRow.avg_minutes_per_task as number | null) ?? null,
    },
    translations: flat,
  };
}
