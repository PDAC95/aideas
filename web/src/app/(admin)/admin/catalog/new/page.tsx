import { getTranslations } from "next-intl/server";
import {
  AdminTemplateForm,
  type AdminTemplateFormTranslations,
  type AdminTemplateFormValues,
} from "@/components/admin/catalog/admin-template-form";

/**
 * Admin: create a new automation template.
 *
 * Renders the shared <AdminTemplateForm /> in `create` mode. Initial values
 * are sane defaults — empty strings for translations, `is_active=false` so
 * the operator can save partial work as a draft, and category=`sales` /
 * pricing_tier=`starter` because those are the most common starting points
 * across the seeded catalog.
 */
export default async function NewAdminTemplatePage() {
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
    slug: "",
    is_active: false,
    is_featured: false,
    sort_order: 0,
    icon: "",
    category: "sales",
    industry_tags: [],
    connected_apps: [],
    pricing_tier: "starter",
    setup_price_dollars: "",
    monthly_price_dollars: "",
    setup_time_days: "",
    avg_minutes_per_task: "",
    name_en: "",
    name_es: "",
    description_en: "",
    description_es: "",
    typical_impact_text_en: "",
    typical_impact_text_es: "",
    activity_metric_label_en: "",
    activity_metric_label_es: "",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {translations.newTitle}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      <AdminTemplateForm
        mode="create"
        initialValues={initialValues}
        initialSlugLocked={false}
        initialSlug=""
        translations={translations}
      />
    </div>
  );
}
