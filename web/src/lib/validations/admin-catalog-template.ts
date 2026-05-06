import { z } from "zod";

/**
 * Admin catalog template validation.
 *
 * Two schemas:
 * - `adminCatalogTemplateBaseSchema` — always-required structural validation
 *   (slug shape, enum membership, numeric ranges). Activation-required fields
 *   (translations, prices, metrics, industries) may be empty/null in this
 *   schema; suitable for draft saves where `is_active=false`.
 * - `adminCatalogTemplateActiveSchema` — refines the base with all activation
 *   gates. Used when `is_active=true`; ensures the template is publishable.
 *
 * The form layer chooses between schemas at submit time based on the current
 * value of `is_active`. Server actions perform the same selection so the
 * server is authoritative — a malicious client cannot bypass activation
 * validation by setting is_active client-side and then flipping it server-side.
 *
 * Pricing: the form sends prices in CENTS (form converts dollars * 100 before
 * submit). The schema sees integers, not floats. Null is allowed in draft
 * mode and rejected in active mode.
 */

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const ADMIN_CATALOG_CATEGORIES = [
  "customer_service",
  "documents",
  "marketing",
  "sales",
  "operations",
  "productivity",
  "reports",
  "ai_agents",
] as const;

export const ADMIN_CATALOG_INDUSTRIES = [
  "retail",
  "salud",
  "legal",
  "inmobiliaria",
  "restaurantes",
  "agencias",
] as const;

export const ADMIN_CATALOG_PRICING_TIERS = [
  "starter",
  "pro",
  "business",
] as const;

export const adminCatalogTemplateBaseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(SLUG_RE, "invalid_slug"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int().min(0),

  // Translations — strings, may be empty in draft mode.
  name_en: z.string().max(255),
  name_es: z.string().max(255),
  description_en: z.string(),
  description_es: z.string(),
  typical_impact_text_en: z.string(),
  typical_impact_text_es: z.string(),
  activity_metric_label_en: z.string().max(100),
  activity_metric_label_es: z.string().max(100),

  // Categorization + lists.
  category: z.enum(ADMIN_CATALOG_CATEGORIES),
  industry_tags: z.array(z.enum(ADMIN_CATALOG_INDUSTRIES)).default([]),
  connected_apps: z.array(z.string().min(1)).default([]),

  // Pricing (cents). Null allowed in draft, refined to non-null when active.
  pricing_tier: z.enum(ADMIN_CATALOG_PRICING_TIERS),
  setup_price: z.coerce.number().int().min(0).nullable(),
  monthly_price: z.coerce.number().int().min(0).nullable(),

  // Metrics. Null allowed in draft, refined to non-null when active.
  setup_time_days: z.coerce.number().int().min(1).max(30).nullable(),
  avg_minutes_per_task: z.coerce.number().int().min(1).max(480).nullable(),

  // Optional.
  icon: z.string().max(50).nullable().optional(),
});

export type AdminCatalogTemplateInput = z.infer<
  typeof adminCatalogTemplateBaseSchema
>;

/**
 * Active mode — refines base to require all activation-gated fields.
 *
 * When `is_active=false` the refinement is a no-op so partial work can be
 * saved as a draft. When `is_active=true`, every required field that was
 * `nullable()` in the base is asserted non-null/non-empty.
 */
export const adminCatalogTemplateActiveSchema =
  adminCatalogTemplateBaseSchema.superRefine((data, ctx) => {
    if (!data.is_active) return;

    const requiredText = [
      "name_en",
      "name_es",
      "description_en",
      "description_es",
      "typical_impact_text_en",
      "typical_impact_text_es",
      "activity_metric_label_en",
      "activity_metric_label_es",
    ] as const;

    for (const field of requiredText) {
      const value = data[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        ctx.addIssue({
          path: [field],
          code: "custom",
          message: "required_when_active",
        });
      }
    }

    const requiredNumeric = [
      "setup_price",
      "monthly_price",
      "setup_time_days",
      "avg_minutes_per_task",
    ] as const;

    for (const field of requiredNumeric) {
      if (data[field] == null) {
        ctx.addIssue({
          path: [field],
          code: "custom",
          message: "required_when_active",
        });
      }
    }

    if (data.industry_tags.length === 0) {
      ctx.addIssue({
        path: ["industry_tags"],
        code: "custom",
        message: "pick_at_least_one",
      });
    }
  });

/**
 * Helper: pick the right schema based on is_active.
 *
 * Used by both the client form (resolver swap on toggle) and the server
 * actions (authoritative validation).
 */
export function pickAdminCatalogTemplateSchema(isActive: boolean) {
  return isActive
    ? adminCatalogTemplateActiveSchema
    : adminCatalogTemplateBaseSchema;
}
