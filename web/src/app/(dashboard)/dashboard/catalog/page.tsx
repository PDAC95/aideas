import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCatalogTemplates } from "@/lib/dashboard/queries";
import { CatalogClient } from "@/components/dashboard/catalog-client";

interface CatalogPageProps {
  searchParams: Promise<{ category?: string; industry?: string; search?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel fetch: templates, catalog chrome translations, locale
  const [templates, t, locale] = await Promise.all([
    fetchCatalogTemplates(),
    getTranslations("dashboard.catalog"),
    getLocale(),
  ]);

  // Template name translations (namespace: "templates")
  const tTemplates = await getTranslations("templates");

  // Resolve display names for each template
  // template.name stores keys like "templates.lead_followup_email.name"
  // extract middle segment and look up via tTemplates("lead_followup_email.name")
  const templatesWithNames = templates.map((template) => {
    // name format: "templates.{slug_snake}.name"
    const parts = template.name.split(".");
    // parts[0] = "templates", parts[1] = slug_snake, parts[2] = "name"
    const slugSnake = parts[1] ?? template.slug.replace(/-/g, "_");
    let displayName: string;
    try {
      displayName = tTemplates(`${slugSnake}.name`);
    } catch {
      displayName = slugSnake.replace(/_/g, " ");
    }
    return { ...template, displayName };
  });

  // Read search params (Next.js 15+ — searchParams is a Promise)
  const { category, industry, search } = await searchParams;

  // Build translations object for CatalogClient
  const translations = {
    title: t("title"),
    subtitle: t.raw("subtitle"),
    searchPlaceholder: t("searchPlaceholder"),
    clearFilters: t("clearFilters"),
    popularBadge: t("popularBadge"),
    emptyTitle: t("emptyTitle"),
    emptyCta: t("emptyCta"),
    monthlyPrice: t.raw("monthlyPrice"),
    categories: {
      all: t("categories.all"),
      mas_populares: t("categories.mas_populares"),
      sales: t("categories.sales"),
      marketing: t("categories.marketing"),
      customer_service: t("categories.customer_service"),
      documents: t("categories.documents"),
      productivity: t("categories.productivity"),
      operations: t("categories.operations"),
      reports: t("categories.reports"),
      ai_agents: t("categories.ai_agents"),
    },
    industries: {
      all: t("industries.all"),
      retail: t("industries.retail"),
      salud: t("industries.salud"),
      legal: t("industries.legal"),
      inmobiliaria: t("industries.inmobiliaria"),
      restaurantes: t("industries.restaurantes"),
      agencias: t("industries.agencias"),
    },
  };

  return (
    <CatalogClient
      templates={templatesWithNames}
      initialCategory={category ?? "all"}
      initialIndustry={industry ?? "all"}
      initialSearch={search ?? ""}
      translations={translations}
      locale={locale}
    />
  );
}
