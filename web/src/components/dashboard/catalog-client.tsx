"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CatalogCard } from "@/components/dashboard/catalog-card";
import type { CatalogTemplate } from "@/lib/dashboard/types";

type TemplateWithDisplayName = CatalogTemplate & { displayName: string };

interface CatalogClientProps {
  templates: TemplateWithDisplayName[];
  initialCategory: string;
  initialIndustry: string;
  initialSearch: string;
  translations: {
    title: string;
    subtitle: string;       // template with {filtered}/{total}
    searchPlaceholder: string;
    clearFilters: string;
    popularBadge: string;
    emptyTitle: string;
    emptyCta: string;
    monthlyPrice: string;   // template with {price}
    categories: Record<string, string>;
    industries: Record<string, string>;
  };
  locale: string;
}

const CATEGORY_ORDER = [
  "all",
  "mas_populares",
  "sales",
  "marketing",
  "customer_service",
  "documents",
  "productivity",
  "reports",
  "ai_agents",
];

// Format price from integer cents
function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CatalogClient({
  templates,
  initialCategory,
  initialIndustry,
  initialSearch,
  translations,
  locale,
}: CatalogClientProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [category, setCategory] = useState(initialCategory || "all");
  const [industry, setIndustry] = useState(initialIndustry || "all");
  const [search, setSearch] = useState(initialSearch || "");

  // Update URL query params
  const updateParams = useCallback(
    (newCategory: string, newIndustry: string, newSearch: string) => {
      const params = new URLSearchParams();
      if (newCategory && newCategory !== "all") params.set("category", newCategory);
      if (newIndustry && newIndustry !== "all") params.set("industry", newIndustry);
      if (newSearch) params.set("search", newSearch);
      const qs = params.toString();
      router.replace("/dashboard/catalog" + (qs ? "?" + qs : ""), { scroll: false });
    },
    [router]
  );

  const handleCategoryChange = useCallback(
    (val: string) => {
      setCategory(val);
      updateParams(val, industry, search);
    },
    [industry, search, updateParams]
  );

  const handleIndustryChange = useCallback(
    (val: string) => {
      const next = val === industry ? "all" : val;
      setIndustry(next);
      updateParams(category, next, search);
    },
    [category, industry, search, updateParams]
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      // Debounce URL update by 300ms
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateParams(category, industry, val);
      }, 300);
    },
    [category, industry, updateParams]
  );

  const resetFilters = useCallback(() => {
    setCategory("all");
    setIndustry("all");
    setSearch("");
    router.replace("/dashboard/catalog", { scroll: false });
  }, [router]);

  // Compute category counts from full templates array (not filtered)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length, mas_populares: 0 };
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
      if (t.is_featured) counts.mas_populares += 1;
    });
    return counts;
  }, [templates]);

  // Compute industry list from all templates
  const industryKeys = useMemo(() => {
    return Object.keys(translations.industries);
  }, [translations.industries]);

  // Apply filters with AND logic
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Category filter
      if (category !== "all") {
        if (category === "mas_populares") {
          if (!t.is_featured) return false;
        } else {
          if (t.category !== category) return false;
        }
      }
      // Industry filter
      if (industry !== "all") {
        if (!(t.industry_tags ?? []).includes(industry)) return false;
      }
      // Search filter
      if (search !== "") {
        if (!t.displayName.toLowerCase().includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [templates, category, industry, search]);

  const subtitleText = translations.subtitle
    .replace("{filtered}", String(filteredTemplates.length))
    .replace("{total}", String(templates.length));

  return (
    <div>
      {/* Page header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {translations.title}
        </h1>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={translations.searchPlaceholder}
          className={cn(
            "w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
            "pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "transition-colors duration-150"
          )}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CATEGORY_ORDER.map((key) => {
          const label = translations.categories[key];
          if (!label) return null;
          const count = categoryCounts[key] ?? 0;
          const isActive = category === key;
          return (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {label}
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full text-xs px-1.5 py-0.5 min-w-[1.25rem]",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Industry chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {industryKeys.map((key) => {
          const label = translations.industries[key];
          if (!label) return null;
          const isActive = industry === key;
          return (
            <button
              key={key}
              onClick={() => handleIndustryChange(key)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "border-2 border-purple-600 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-400"
                  : "border border-gray-200 text-gray-600 bg-white hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {subtitleText}
      </p>

      {/* Grid or empty state */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl select-none" aria-hidden="true">
            🔍
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {translations.emptyTitle}
          </h2>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            {translations.emptyCta}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((t) => (
            <CatalogCard
              key={t.id}
              slug={t.slug}
              displayName={t.displayName}
              category={t.category}
              monthlyPriceFormatted={translations.monthlyPrice.replace(
                "{price}",
                formatPrice(t.monthly_price, locale)
              )}
              industryTags={t.industry_tags ?? []}
              connectedApps={t.connected_apps ?? []}
              isFeatured={t.is_featured}
              popularBadgeLabel={translations.popularBadge}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
