"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Search, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCatalogTemplate } from "@/lib/admin/catalog-queries";
import {
  AdminCatalogTable,
  type AdminCatalogTableTranslations,
} from "@/components/admin/catalog/admin-catalog-table";
import { AdminCatalogGrid } from "@/components/admin/catalog/admin-catalog-grid";
import type { CatalogToggleCellTranslations } from "@/components/admin/catalog/catalog-toggle-cell";

type ViewMode = "table" | "grid";

interface AdminCatalogClientTranslations {
  viewToggle: { table: string; grid: string };
  searchPlaceholder: string;
  filters: {
    categoryAll: string;
    industryAll: string;
    categories: Record<string, string>;
    industries: Record<string, string>;
  };
  columns: AdminCatalogTableTranslations["columns"];
  toggle: CatalogToggleCellTranslations;
  empty: { title: string; cta: string };
  count: string; // template with {filtered} / {total}
}

interface AdminCatalogClientProps {
  templates: AdminCatalogTemplate[];
  initialView: ViewMode;
  initialCategory: string;
  initialIndustry: string;
  initialSearch: string;
  translations: AdminCatalogClientTranslations;
  locale: string;
}

const CATEGORY_KEYS = [
  "customer_service",
  "documents",
  "marketing",
  "sales",
  "operations",
  "productivity",
  "reports",
  "ai_agents",
];

const INDUSTRY_KEYS = [
  "retail",
  "salud",
  "legal",
  "inmobiliaria",
  "restaurantes",
  "agencias",
];

/**
 * Owns view-toggle, search, and filter state for the admin catalog list.
 *
 * URL sync mirrors the customer catalog/client pattern: every state change
 * is reflected in the URL via router.replace(...) without a scroll jump.
 * Search input is debounced 300ms before pushing to the URL — local state
 * updates immediately so typing feels instant.
 */
export function AdminCatalogClient({
  templates,
  initialView,
  initialCategory,
  initialIndustry,
  initialSearch,
  translations,
  locale,
}: AdminCatalogClientProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [view, setView] = useState<ViewMode>(initialView);
  const [category, setCategory] = useState(initialCategory || "all");
  const [industry, setIndustry] = useState(initialIndustry || "all");
  const [search, setSearch] = useState(initialSearch || "");

  const updateUrl = useCallback(
    (next: { view: ViewMode; category: string; industry: string; search: string }) => {
      const params = new URLSearchParams();
      if (next.view !== "table") params.set("view", next.view);
      if (next.category && next.category !== "all") params.set("category", next.category);
      if (next.industry && next.industry !== "all") params.set("industry", next.industry);
      if (next.search) params.set("search", next.search);
      const qs = params.toString();
      router.replace("/admin/catalog" + (qs ? "?" + qs : ""), { scroll: false });
    },
    [router]
  );

  const handleViewChange = useCallback(
    (v: ViewMode) => {
      setView(v);
      updateUrl({ view: v, category, industry, search });
    },
    [category, industry, search, updateUrl]
  );

  const handleCategoryChange = useCallback(
    (val: string) => {
      setCategory(val);
      updateUrl({ view, category: val, industry, search });
    },
    [view, industry, search, updateUrl]
  );

  const handleIndustryChange = useCallback(
    (val: string) => {
      setIndustry(val);
      updateUrl({ view, category, industry: val, search });
    },
    [view, category, search, updateUrl]
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateUrl({ view, category, industry, search: val });
      }, 300);
    },
    [view, category, industry, updateUrl]
  );

  const resetFilters = useCallback(() => {
    setCategory("all");
    setIndustry("all");
    setSearch("");
    updateUrl({ view, category: "all", industry: "all", search: "" });
  }, [view, updateUrl]);

  const filteredTemplates = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (industry !== "all" && !(t.industry_tags ?? []).includes(industry)) return false;
      if (needle !== "") {
        const matchesName = t.displayName.toLowerCase().includes(needle);
        const matchesSlug = t.slug.toLowerCase().includes(needle);
        if (!matchesName && !matchesSlug) return false;
      }
      return true;
    });
  }, [templates, category, industry, search]);

  const countText = translations.count
    .replace("{filtered}", String(filteredTemplates.length))
    .replace("{total}", String(templates.length));

  return (
    <div className="space-y-4">
      {/* Toolbar row 1: view toggle (right) */}
      <div className="flex items-center justify-end">
        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "table"}
            onClick={() => handleViewChange("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "table"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <TableIcon className="h-3.5 w-3.5" />
            {translations.viewToggle.table}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "grid"}
            onClick={() => handleViewChange("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              view === "grid"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {translations.viewToggle.grid}
          </button>
        </div>
      </div>

      {/* Toolbar row 2: search + filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={translations.searchPlaceholder}
            className={cn(
              "w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white",
              "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
            )}
          />
        </div>

        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={cn(
            "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          )}
        >
          <option value="all">{translations.filters.categoryAll}</option>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {translations.filters.categories[key] ?? key}
            </option>
          ))}
        </select>

        <select
          value={industry}
          onChange={(e) => handleIndustryChange(e.target.value)}
          className={cn(
            "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white",
            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          )}
        >
          <option value="all">{translations.filters.industryAll}</option>
          {INDUSTRY_KEYS.map((key) => (
            <option key={key} value={key}>
              {translations.filters.industries[key] ?? key}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">{countText}</p>

      {/* List or empty state */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {translations.empty.title}
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            {translations.empty.cta}
          </button>
        </div>
      ) : view === "grid" ? (
        <AdminCatalogGrid
          templates={filteredTemplates}
          translations={{
            columns: {
              setupPrice: translations.columns.setupPrice,
              monthlyPrice: translations.columns.monthlyPrice,
            },
            filters: {
              categories: translations.filters.categories,
              industries: translations.filters.industries,
            },
            toggle: translations.toggle,
          }}
          locale={locale}
        />
      ) : (
        <AdminCatalogTable
          templates={filteredTemplates}
          translations={{
            columns: translations.columns,
            filters: {
              categories: translations.filters.categories,
              industries: translations.filters.industries,
            },
            toggle: translations.toggle,
          }}
          locale={locale}
        />
      )}
    </div>
  );
}
