"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminCatalogTemplate } from "@/lib/admin/catalog-queries";
import {
  CatalogToggleCell,
  type CatalogToggleCellTranslations,
} from "@/components/admin/catalog/catalog-toggle-cell";

export interface AdminCatalogTableTranslations {
  columns: {
    name: string;
    slug: string;
    category: string;
    industries: string;
    pricingTier: string;
    setupPrice: string;
    monthlyPrice: string;
    active: string;
    featured: string;
  };
  filters: {
    categories: Record<string, string>;
    industries: Record<string, string>;
  };
  toggle: CatalogToggleCellTranslations;
}

interface AdminCatalogTableProps {
  templates: AdminCatalogTemplate[];
  translations: AdminCatalogTableTranslations;
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

function PricingTierBadge({ tier }: { tier: string }) {
  const tone =
    tier === "business"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
      : tier === "pro"
        ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        tone
      )}
    >
      {tier}
    </span>
  );
}

/**
 * Dense 9-column admin catalog table.
 *
 * Columns: Name, Slug, Category, Industries, Pricing tier, Setup, Monthly,
 * Active, Featured. Inactive rows are visually de-emphasized via opacity.
 *
 * Inactive rows still render their toggle so an operator can re-activate.
 */
export function AdminCatalogTable({
  templates,
  translations,
  locale,
}: AdminCatalogTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="max-h-[calc(100vh-22rem)] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-xs uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.name}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.slug}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.category}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.industries}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.pricingTier}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {translations.columns.setupPrice}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                {translations.columns.monthlyPrice}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.active}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {translations.columns.featured}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {templates.map((tpl) => {
              const industries = tpl.industry_tags ?? [];
              const visibleIndustries = industries.slice(0, 2);
              const hiddenCount = industries.length - visibleIndustries.length;
              return (
                <tr
                  key={tpl.id}
                  className={cn(
                    "transition-colors hover:bg-gray-50 even:bg-gray-50/40 dark:hover:bg-gray-800/60 dark:even:bg-gray-800/30",
                    !tpl.is_active && "opacity-60"
                  )}
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/catalog/${tpl.slug}/edit`}
                      className="font-medium text-gray-900 hover:text-purple-700 hover:underline dark:text-white dark:hover:text-purple-300"
                    >
                      {tpl.displayName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {tpl.slug}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                    {translations.filters.categories[tpl.category] ?? tpl.category}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {visibleIndustries.map((ind) => (
                        <span
                          key={ind}
                          className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                        >
                          {translations.filters.industries[ind] ?? ind}
                        </span>
                      ))}
                      {hiddenCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          +{hiddenCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <PricingTierBadge tier={tpl.pricing_tier} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {formatCurrency(tpl.setup_price, locale)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {formatCurrency(tpl.monthly_price, locale)}
                  </td>
                  <td className="px-3 py-2">
                    <CatalogToggleCell
                      field="active"
                      templateId={tpl.id}
                      initial={tpl.is_active}
                      hasActiveAutomations={tpl.has_active_automations}
                      activeAutomationsCount={tpl.active_automations_count}
                      translations={translations.toggle}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <CatalogToggleCell
                      field="featured"
                      templateId={tpl.id}
                      initial={tpl.is_featured}
                      translations={translations.toggle}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
