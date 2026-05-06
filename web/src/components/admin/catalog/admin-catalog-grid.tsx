"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminCatalogTemplate } from "@/lib/admin/catalog-queries";
import {
  CatalogToggleCell,
  type CatalogToggleCellTranslations,
} from "@/components/admin/catalog/catalog-toggle-cell";

export interface AdminCatalogGridTranslations {
  columns: {
    setupPrice: string;
    monthlyPrice: string;
  };
  filters: {
    categories: Record<string, string>;
    industries: Record<string, string>;
  };
  toggle: CatalogToggleCellTranslations;
}

interface AdminCatalogGridProps {
  templates: AdminCatalogTemplate[];
  translations: AdminCatalogGridTranslations;
  locale: string;
}

function formatCurrency(cents: number | null, locale: string): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Grid layout alternative to the dense table. Each card surfaces the same
 * decision-making fields and reuses the same CatalogToggleCell so behavior
 * is identical regardless of the chosen view.
 */
export function AdminCatalogGrid({
  templates,
  translations,
  locale,
}: AdminCatalogGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((tpl) => {
        const industries = tpl.industry_tags ?? [];
        return (
          <div
            key={tpl.id}
            className={cn(
              "flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",
              !tpl.is_active && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/admin/catalog/${tpl.slug}/edit`}
                className="font-medium text-gray-900 hover:text-purple-700 hover:underline dark:text-white dark:hover:text-purple-300"
              >
                {tpl.displayName}
              </Link>
              <span
                className={cn(
                  "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                  tpl.pricing_tier === "business"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                    : tpl.pricing_tier === "pro"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                {tpl.pricing_tier}
              </span>
            </div>

            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{tpl.slug}</p>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {translations.filters.categories[tpl.category] ?? tpl.category}
            </p>

            <div className="flex flex-wrap items-center gap-1">
              {industries.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                >
                  {translations.filters.industries[ind] ?? ind}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {translations.columns.setupPrice}
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(tpl.setup_price, locale)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {translations.columns.monthlyPrice}
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(tpl.monthly_price, locale)}
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 pt-2">
              <CatalogToggleCell
                field="active"
                templateId={tpl.id}
                initial={tpl.is_active}
                hasActiveAutomations={tpl.has_active_automations}
                activeAutomationsCount={tpl.active_automations_count}
                translations={translations.toggle}
              />
              <CatalogToggleCell
                field="featured"
                templateId={tpl.id}
                initial={tpl.is_featured}
                translations={translations.toggle}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
