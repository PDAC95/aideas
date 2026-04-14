import Link from "next/link";
import { cn } from "@/lib/utils";

interface CatalogCardProps {
  slug: string;
  displayName: string;          // Pre-resolved i18n name
  category: string;
  monthlyPriceFormatted: string; // Pre-formatted "$49/mo" string
  industryTags: string[];
  connectedApps: string[];
  isFeatured: boolean;
  popularBadgeLabel: string;
  locale: string;
}

// Deterministic color from a string (hash-based) — copied from automation-card.tsx
const APP_COLORS = [
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
];

function getAppColor(appName: string): string {
  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = (hash * 31 + appName.charCodeAt(i)) & 0xffff;
  }
  return APP_COLORS[hash % APP_COLORS.length];
}

export function CatalogCard({
  slug,
  displayName,
  category,
  monthlyPriceFormatted,
  industryTags,
  connectedApps,
  isFeatured,
  popularBadgeLabel,
}: CatalogCardProps) {
  // Connected apps — show max 4, "+N" for overflow
  const MAX_APPS = 4;
  const visibleApps = connectedApps.slice(0, MAX_APPS);
  const extraApps = connectedApps.length - MAX_APPS;

  return (
    <Link
      href={`/dashboard/catalog/${slug}`}
      className={cn(
        "group block rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
        "p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer",
        "animate-in fade-in duration-300"
      )}
    >
      {/* Top row: name + popular badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate">
          {displayName}
        </h3>
        {isFeatured && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            {popularBadgeLabel}
          </span>
        )}
      </div>

      {/* Category */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 capitalize">
        {category.replace(/_/g, " ")}
      </p>

      {/* Industry tags */}
      {industryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {industryTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Connected app badges */}
      {visibleApps.length > 0 && (
        <div className="flex items-center gap-1 mb-3 mt-1">
          {visibleApps.map((app) => (
            <span
              key={app}
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                getAppColor(app)
              )}
              title={app}
            >
              {app.slice(0, 2).toUpperCase()}
            </span>
          ))}
          {extraApps > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              +{extraApps}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: price (right-aligned) */}
      <div className="flex items-center justify-end mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">
          {monthlyPriceFormatted}
        </span>
      </div>
    </Link>
  );
}
