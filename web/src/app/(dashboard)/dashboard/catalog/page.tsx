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

  // Resolve locale first so we can pass it to fetchCatalogTemplates.
  const locale = await getLocale();

  // Parallel fetch: locale-aware templates (with displayName already resolved
  // from automation_template_translations) and catalog chrome translations.
  const [templates, t] = await Promise.all([
    fetchCatalogTemplates(locale),
    getTranslations("dashboard.catalog"),
  ]);

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
      templates={templates}
      initialCategory={category ?? "all"}
      initialIndustry={industry ?? "all"}
      initialSearch={search ?? ""}
      translations={translations}
      locale={locale}
    />
  );
}
