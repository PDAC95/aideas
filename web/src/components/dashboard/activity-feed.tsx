import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrichedExecution {
  id: string;
  automationName: string;
  status: "running" | "success" | "error" | "cancelled";
  errorMessage: string | null;
  timeAgo: string;
}

interface ActivityFeedProps {
  executions: EnrichedExecution[];
  translations: {
    title: string;
    viewAll: string;
    errorBadge: string;
    noActivity: string;
  };
}

const statusDot: Record<EnrichedExecution["status"], string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  running: "bg-blue-500",
  cancelled: "bg-gray-400",
};

export function ActivityFeed({ executions, translations }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {translations.title}
        </h2>
        <Link
          href="/dashboard/reports"
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {translations.viewAll}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Execution rows */}
      {executions.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          {translations.noActivity}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {executions.map((exec) => (
            <li key={exec.id} className="px-6 py-3 flex items-center gap-3">
              {/* Status dot */}
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  statusDot[exec.status]
                )}
              />

              {/* Automation name + error badge */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-sm text-gray-900 dark:text-white truncate">
                  {exec.automationName}
                </span>
                {exec.status === "error" && (
                  <span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {translations.errorBadge}
                  </span>
                )}
              </div>

              {/* Relative time */}
              <span className="text-xs text-muted-foreground shrink-0">
                {exec.timeAgo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
