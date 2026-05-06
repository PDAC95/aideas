import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAdminTemplateForEdit } from "@/lib/admin/catalog-detail-queries";
import {
  AdminTemplateForm,
  type AdminTemplateFormTranslations,
  type AdminTemplateFormValues,
} from "@/components/admin/catalog/admin-template-form";
import {
  ADMIN_CATALOG_CATEGORIES,
  ADMIN_CATALOG_PRICING_TIERS,
} from "@/lib/validations/admin-catalog-template";

interface EditAdminTemplatePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Coerce the persisted category/pricing_tier strings to the strict literal
 * unions the form expects. Defensive — if the DB ever holds a value outside
 * the enum (e.g. legacy rows from before a CHECK was tightened), we fall
 * back to a safe default rather than crashing the form.
 */
function safeCategory(
  raw: string
): (typeof ADMIN_CATALOG_CATEGORIES)[number] {
  return (ADMIN_CATALOG_CATEGORIES as readonly string[]).includes(raw)
    ? (raw as (typeof ADMIN_CATALOG_CATEGORIES)[number])
    : "sales";
}

function safePricingTier(
  raw: string
): (typeof ADMIN_CATALOG_PRICING_TIERS)[number] {
  return (ADMIN_CATALOG_PRICING_TIERS as readonly string[]).includes(raw)
    ? (raw as (typeof ADMIN_CATALOG_PRICING_TIERS)[number])
    : "starter";
}

/**
 * Convert integer cents to a string-USD representation suitable for the
 * form's USD input. Null cents -> empty string.
 */
function centsToDollarString(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toString();
}

/**
 * Admin: edit an existing automation template by slug.
 *
 * Pre-loads the template + 8 translation rows server-side and passes them
 * as initial values to <AdminTemplateForm mode="edit" />. Slug is locked
 * (read-only) on this page per CONTEXT.md decision — changing slug post-
 * creation would break i18n keys and customer-facing URLs.
 */
export default async function EditAdminTemplatePage({
  params,
}: EditAdminTemplatePageProps) {
  const { slug } = await params;
  const data = await fetchAdminTemplateForEdit(slug);
  if (!data) notFound();

  const t = await getTranslations("admin.catalog");
  const tForm = await getTranslations("admin.catalog.form");
  const tFilters = await getTranslations("admin.catalog.filters");

  const translations: AdminTemplateFormTranslations = {
    newTitle: tForm("newTitle"),
    editTitle: tForm("editTitle"),
    submitCreate: tForm("submitCreate"),
    submitUpdate: tForm("submitUpdate"),
    submitting: tForm("submitting"),
    cancel: tForm("cancel"),
    sections: {
      basicInfo: tForm("sections.basicInfo"),
      categorization: tForm("sections.categorization"),
      pricing: tForm("sections.pricing"),
      metrics: tForm("sections.metrics"),
      translations: tForm("sections.translations"),
    },
    fields: {
      slug: tForm("fields.slug"),
      slugHelp: tForm("fields.slugHelp"),
      isActive: tForm("fields.isActive"),
      isActiveHelp: tForm("fields.isActiveHelp"),
      isFeatured: tForm("fields.isFeatured"),
      sortOrder: tForm("fields.sortOrder"),
      icon: tForm("fields.icon"),
      iconHelp: tForm("fields.iconHelp"),
      category: tForm("fields.category"),
      industries: tForm("fields.industries"),
      industriesHelp: tForm("fields.industriesHelp"),
      connectedApps: tForm("fields.connectedApps"),
      connectedAppsHelp: tForm("fields.connectedAppsHelp"),
      connectedAppsPlaceholder: tForm("fields.connectedAppsPlaceholder"),
      pricingTier: tForm("fields.pricingTier"),
      setupPrice: tForm("fields.setupPrice"),
      monthlyPrice: tForm("fields.monthlyPrice"),
      setupTimeDays: tForm("fields.setupTimeDays"),
      avgMinutesPerTask: tForm("fields.avgMinutesPerTask"),
      nameEn: tForm("fields.nameEn"),
      nameEs: tForm("fields.nameEs"),
      descriptionEn: tForm("fields.descriptionEn"),
      descriptionEs: tForm("fields.descriptionEs"),
      impactEn: tForm("fields.impactEn"),
      impactEs: tForm("fields.impactEs"),
      metricLabelEn: tForm("fields.metricLabelEn"),
      metricLabelEs: tForm("fields.metricLabelEs"),
    },
    errors: {
      required_when_active: tForm("errors.required_when_active"),
      invalid_slug: tForm("errors.invalid_slug"),
      slug_taken: tForm("errors.slug_taken"),
      pick_at_least_one: tForm("errors.pick_at_least_one"),
      create_failed: tForm("errors.create_failed"),
      update_failed: tForm("errors.update_failed"),
      not_found: tForm("errors.not_found"),
      not_authenticated: tForm("errors.not_authenticated"),
      not_staff: tForm("errors.not_staff"),
    },
    categories: {
      customer_service: tFilters("categories.customer_service"),
      documents: tFilters("categories.documents"),
      marketing: tFilters("categories.marketing"),
      sales: tFilters("categories.sales"),
      operations: tFilters("categories.operations"),
      productivity: tFilters("categories.productivity"),
      reports: tFilters("categories.reports"),
      ai_agents: tFilters("categories.ai_agents"),
    },
    industries: {
      retail: tFilters("industries.retail"),
      salud: tFilters("industries.salud"),
      legal: tFilters("industries.legal"),
      inmobiliaria: tFilters("industries.inmobiliaria"),
      restaurantes: tFilters("industries.restaurantes"),
      agencias: tFilters("industries.agencias"),
    },
    pricingTiers: {
      starter: "Starter",
      pro: "Pro",
      business: "Business",
    },
  };

  const initialValues: AdminTemplateFormValues = {
    slug: data.template.slug,
    is_active: data.template.is_active,
    is_featured: data.template.is_featured,
    sort_order: data.template.sort_order,
    icon: data.template.icon ?? "",
    category: safeCategory(data.template.category),
    industry_tags: data.template.industry_tags,
    connected_apps: data.template.connected_apps,
    pricing_tier: safePricingTier(data.template.pricing_tier),
    setup_price_dollars: centsToDollarString(data.template.setup_price),
    monthly_price_dollars: centsToDollarString(data.template.monthly_price),
    setup_time_days:
      data.template.setup_time_days != null
        ? String(data.template.setup_time_days)
        : "",
    avg_minutes_per_task:
      data.template.avg_minutes_per_task != null
        ? String(data.template.avg_minutes_per_task)
        : "",
    name_en: data.translations.name_en,
    name_es: data.translations.name_es,
    description_en: data.translations.description_en,
    description_es: data.translations.description_es,
    typical_impact_text_en: data.translations.typical_impact_text_en,
    typical_impact_text_es: data.translations.typical_impact_text_es,
    activity_metric_label_en: data.translations.activity_metric_label_en,
    activity_metric_label_es: data.translations.activity_metric_label_es,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {translations.editTitle}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      <AdminTemplateForm
        mode="edit"
        initialValues={initialValues}
        initialSlugLocked={true}
        initialSlug={data.template.slug}
        translations={translations}
      />
    </div>
  );
}
