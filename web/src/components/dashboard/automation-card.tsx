import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { AutomationsPageAutomation } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  automation: AutomationsPageAutomation;
  statusLabel: string;
  translations: {
    monthlyMetric: string; // template string with {count}
    monthlyPrice: string;  // template string with {price}
    configuring: string;
    noData: string;
  };
  locale: string;
}

// Deterministic color from a string (hash-based)
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

export function AutomationCard({
  automation,
  statusLabel,
  translations,
  locale,
}: AutomationCardProps) {
  const { id, name, status, template, monthly_execution_count } = automation;
  const connectedApps = template?.connected_apps ?? [];
  const monthlyPrice = template?.monthly_price ?? null;
  const activityMetricLabel = template?.activity_metric_label ?? null;
  const category = template?.category ?? null;

  // Format number for locale
  const formatNumber = (n: number) =>
    new Intl.NumberFormat(locale).format(n);

  // Format price from integer cents
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  // Monthly metric display
  const showConfiguring = status === "in_setup";
  const metricText = showConfiguring
    ? translations.configuring
    : monthly_execution_count > 0
    ? translations.monthlyMetric.replace("{count}", formatNumber(monthly_execution_count))
    : translations.noData;

  // Price display
  const priceText = monthlyPrice != null
    ? translations.monthlyPrice.replace("{price}", formatPrice(monthlyPrice))
    : translations.noData;

  // Connected apps — show max 4, "+N" for overflow
  const MAX_APPS = 4;
  const visibleApps = connectedApps.slice(0, MAX_APPS);
  const extraApps = connectedApps.length - MAX_APPS;

  return (
    <Link
      href={`/dashboard/automations/${id}`}
      className={cn(
        "group block rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700",
        "p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 cursor-pointer",
        "animate-in fade-in duration-300"
      )}
    >
      {/* Top row: name + status badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug truncate">
          {name}
        </h3>
        <div className="shrink-0">
          <StatusBadge status={status} label={statusLabel} />
        </div>
      </div>

      {/* Category */}
      {category && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 capitalize">
          {category.replace(/_/g, " ")}
        </p>
      )}

      {/* Connected app badges */}
      {visibleApps.length > 0 && (
        <div className="flex items-center gap-1 mb-3 mt-2">
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

      {/* Bottom row: metric + price */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {metricText}
          {activityMetricLabel && !showConfiguring && monthly_execution_count > 0 && (
            <> {activityMetricLabel}</>
          )}
        </span>
        <span className="text-xs font-semibold text-gray-900 dark:text-white shrink-0 ml-2">
          {priceText}
        </span>
      </div>
    </Link>
  );
}
