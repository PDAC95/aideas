import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { fetchAdminCatalogTemplates } from "@/lib/admin/catalog-queries";
import { AdminCatalogClient } from "@/components/admin/catalog/admin-catalog-client";

interface AdminCatalogPageProps {
  searchParams: Promise<{
    view?: "table" | "grid";
    category?: string;
    industry?: string;
    search?: string;
  }>;
}

/**
 * Admin catalog list. Unlike the customer catalog this includes inactive
 * templates and exposes inline switches for is_active / is_featured. The
 * server component fetches all templates with their active-automation counts
 * and forwards everything to the client component which owns view-toggle,
 * search, and filter state synced to the URL.
 */
export default async function AdminCatalogPage({ searchParams }: AdminCatalogPageProps) {
  const locale = await getLocale();

  const [templates, t] = await Promise.all([
    fetchAdminCatalogTemplates(locale),
    getTranslations("admin.catalog"),
  ]);

  const { view, category, industry, search } = await searchParams;

  // Pre-resolve every label the client component needs. Mirrors the customer
  // catalog/page.tsx pattern: server fetches strings once, client receives
  // them as a plain object — no useTranslations() in the client tree.
  const translations = {
    viewToggle: {
      table: t("viewToggle.table"),
      grid: t("viewToggle.grid"),
    },
    searchPlaceholder: t("search.placeholder"),
    filters: {
      categoryAll: t("filters.categoryAll"),
      industryAll: t("filters.industryAll"),
      categories: {
        customer_service: t("filters.categories.customer_service"),
        documents: t("filters.categories.documents"),
        marketing: t("filters.categories.marketing"),
        sales: t("filters.categories.sales"),
        operations: t("filters.categories.operations"),
        productivity: t("filters.categories.productivity"),
        reports: t("filters.categories.reports"),
        ai_agents: t("filters.categories.ai_agents"),
      } as Record<string, string>,
      industries: {
        retail: t("filters.industries.retail"),
        salud: t("filters.industries.salud"),
        legal: t("filters.industries.legal"),
        inmobiliaria: t("filters.industries.inmobiliaria"),
        restaurantes: t("filters.industries.restaurantes"),
        agencias: t("filters.industries.agencias"),
      } as Record<string, string>,
    },
    columns: {
      name: t("columns.name"),
      slug: t("columns.slug"),
      category: t("columns.category"),
      industries: t("columns.industries"),
      pricingTier: t("columns.pricingTier"),
      setupPrice: t("columns.setupPrice"),
      monthlyPrice: t("columns.monthlyPrice"),
      active: t("columns.active"),
      featured: t("columns.featured"),
    },
    toggle: {
      activeOn: t("toggle.activeOn"),
      activeOff: t("toggle.activeOff"),
      featuredOn: t("toggle.featuredOn"),
      featuredOff: t("toggle.featuredOff"),
      errorRevert: t("toggle.errorRevert"),
      deactivateModal: {
        title: t("deactivateModal.title"),
        body: t.raw("deactivateModal.body") as string,
        confirm: t("deactivateModal.confirm"),
        cancel: t("deactivateModal.cancel"),
      },
    },
    empty: {
      title: t("empty.title"),
      cta: t("empty.cta"),
    },
    count: t.raw("count") as string,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/catalog/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          {t("newButton")}
        </Link>
      </div>

      <AdminCatalogClient
        templates={templates}
        initialView={view ?? "table"}
        initialCategory={category ?? "all"}
        initialIndustry={industry ?? "all"}
        initialSearch={search ?? ""}
        translations={translations}
        locale={locale}
      />
    </div>
  );
}
