import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { DashboardAutomation } from "@/lib/dashboard/types";

interface AutomationListProps {
  automations: DashboardAutomation[];
  rankByExecutions?: boolean;
  translations: {
    title: string;
    viewAll: string;
    dailyMetric: string; // "{count} today" template
    noRuns: string;
    newAutomation: string;
    statusLabels: Record<string, string>;
  };
}

export function AutomationList({
  automations,
  rankByExecutions = false,
  translations,
}: AutomationListProps) {
  const displayedAutomations = automations.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {translations.title}
        </h2>
        <Link
          href="/dashboard/automations"
          className="flex items-center gap-1 text-sm text-purple-400 dark:text-purple-300 hover:underline"
        >
          {translations.viewAll}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Automation rows */}
      {displayedAutomations.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          {translations.noRuns}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayedAutomations.map((automation, index) => {
            const statusLabel =
              translations.statusLabels[automation.status] ?? automation.status;
            const connectedApps = automation.template?.connected_apps;
            const dailyCount = automation.daily_execution_count;

            return (
              <li
                key={automation.id}
                className="px-6 py-3 flex items-center gap-3"
              >
                {/* Rank number */}
                {rankByExecutions && (
                  <span className="text-purple-400 dark:text-purple-300 font-bold text-sm shrink-0 w-6">
                    #{index + 1}
                  </span>
                )}

                {/* Name + apps */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {automation.name}
                  </p>
                  {connectedApps && connectedApps.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {connectedApps.join(", ")}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <StatusBadge
                  status={automation.status}
                  label={statusLabel}
                  className="shrink-0"
                />

                {/* Daily metric */}
                <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                  {dailyCount > 0
                    ? translations.dailyMetric.replace("{count}", String(dailyCount))
                    : translations.noRuns}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* CTA row */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <Link
          href="/dashboard/catalog"
          className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {translations.newAutomation}
        </Link>
      </div>
    </div>
  );
}
