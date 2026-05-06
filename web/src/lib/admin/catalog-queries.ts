import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";

/**
 * Admin-side catalog row.
 *
 * Differs from the customer CatalogTemplate type in two ways:
 * 1. Includes inactive templates (no is_active filter at the query level).
 * 2. Carries `has_active_automations` and `active_automations_count` so the
 *    inline toggle UI can warn before deactivating a template that has
 *    active|in_setup|paused|pending_review automations pointing at it.
 */
export interface AdminCatalogTemplate {
  id: string;
  slug: string;
  displayName: string;
  category: string;
  industry_tags: string[] | null;
  pricing_tier: string;
  setup_price: number | null;
  monthly_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  has_active_automations: boolean;
  active_automations_count: number;
}

const ACTIVE_LIKE_STATUSES = [
  "active",
  "in_setup",
  "paused",
  "pending_review",
] as const;

/**
 * Fetch every template (including inactive ones) for the admin catalog list.
 *
 * - Embed-joins automation_template_translations (LEFT) filtered by locale and
 *   field='name'. LEFT join keeps templates without a translation row visible;
 *   the displayName falls back to the slug.
 * - Issues a second query against `automations` to compute, per template, how
 *   many automations are in active|in_setup|paused|pending_review (and not
 *   soft-deleted). The map is reduced client-side.
 * - Sorts by sort_order ASC, slug ASC so the order is stable across renders.
 *
 * Throws when the caller is not platform staff. The (admin) layout already
 * gates the route, so reaching this query without staff is a hard error.
 */
export async function fetchAdminCatalogTemplates(
  locale: string
): Promise<AdminCatalogTemplate[]> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminCatalogTemplates: not authorized (${auth.error})`);
  }

  const { data: templatesData, error: templatesError } = await supabase
    .from("automation_templates")
    .select(
      `
      id, slug, category, industry_tags, pricing_tier,
      setup_price, monthly_price,
      is_active, is_featured, sort_order,
      translations:automation_template_translations!left(field, value, locale)
      `
    )
    .eq("translations.locale", locale)
    .eq("translations.field", "name")
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  if (templatesError) throw templatesError;

  type RawRow = {
    id: string;
    slug: string;
    category: string;
    industry_tags: string[] | null;
    pricing_tier: string;
    setup_price: number | null;
    monthly_price: number | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number | null;
    translations: Array<{ field: string; value: string; locale: string }> | null;
  };

  const rows = (templatesData ?? []) as unknown as RawRow[];

  // Second query: aggregate active-like automation counts per template.
  const { data: automationsData, error: automationsError } = await supabase
    .from("automations")
    .select("template_id, status")
    .in("status", ACTIVE_LIKE_STATUSES as unknown as string[])
    .is("deleted_at", null);

  if (automationsError) throw automationsError;

  const counts = new Map<string, number>();
  for (const row of (automationsData ?? []) as Array<{ template_id: string | null }>) {
    if (!row.template_id) continue;
    counts.set(row.template_id, (counts.get(row.template_id) ?? 0) + 1);
  }

  return rows.map((row) => {
    const translation = row.translations?.[0];
    const count = counts.get(row.id) ?? 0;
    return {
      id: row.id,
      slug: row.slug,
      displayName: translation?.value ?? row.slug,
      category: row.category,
      industry_tags: row.industry_tags,
      pricing_tier: row.pricing_tier,
      setup_price: row.setup_price,
      monthly_price: row.monthly_price,
      is_active: row.is_active,
      is_featured: row.is_featured,
      has_active_automations: count > 0,
      active_automations_count: count,
    };
  });
}
