import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Loader2, MinusCircle } from "lucide-react";
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
    statusLabels: Record<string, string>;
  };
}

const statusConfig: Record<
  EnrichedExecution["status"],
  {
    icon: React.ComponentType<{ className?: string }>;
    containerBg: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    containerBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    containerBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
  running: {
    icon: Loader2,
    containerBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  cancelled: {
    icon: MinusCircle,
    containerBg: "bg-gray-100 dark:bg-gray-700",
    iconColor: "text-gray-500 dark:text-gray-400",
  },
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
          className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
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
          {executions.map((exec) => {
            const config = statusConfig[exec.status];
            const Icon = config.icon;
            const statusText = translations.statusLabels[exec.status] ?? exec.status;

            return (
              <li key={exec.id} className="px-6 py-3 flex items-start gap-3">
                {/* Status icon */}
                <div
                  className={cn(
                    "flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5",
                    config.containerBg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      config.iconColor,
                      exec.status === "running" && "animate-spin"
                    )}
                  />
                </div>

                {/* Automation name + status description + error badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {exec.automationName}
                    </span>
                    {exec.status === "error" && (
                      <span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {translations.errorBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{statusText}</p>
                </div>

                {/* Relative time */}
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {exec.timeAgo}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
