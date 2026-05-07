import { cn } from "@/lib/utils";
import type { AdminAutomationExecutionEntry } from "@/lib/admin/types";

interface AdminAutomationTimelineProps {
  executions: AdminAutomationExecutionEntry[];
  locale: string;
  translations: {
    title: string;
    empty: string;
    duration: string; // template "{seconds}s"
    statusLabels: {
      running: string;
      success: string;
      error: string;
      cancelled: string;
    };
  };
}

const STATUS_DOT: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  cancelled: "bg-gray-400",
  running: "bg-blue-500 animate-pulse",
};

function formatRelative(iso: string, locale: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffSec) < 60) return rtf.format(-Math.round(diffSec), "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(-diffMonth, "month");
  return rtf.format(-Math.round(diffMonth / 12), "year");
}

export function AdminAutomationTimeline({
  executions,
  locale,
  translations,
}: AdminAutomationTimelineProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {translations.title}
      </h2>
      {executions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {translations.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {executions.map((e) => {
            const dot = STATUS_DOT[e.status] ?? "bg-gray-400";
            const statusKey = e.status as keyof typeof translations.statusLabels;
            const statusLabel = translations.statusLabels[statusKey] ?? e.status;
            // durationMs is raw milliseconds from DB column duration_ms.
            // Convert to whole seconds for the friendlier `{seconds}s` display.
            const durationText =
              e.durationMs != null
                ? translations.duration.replace(
                    "{seconds}",
                    String(Math.round(e.durationMs / 1000))
                  )
                : null;
            return (
              <li key={e.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full",
                    dot
                  )}
                />
                <div className="flex flex-1 items-baseline justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {statusLabel}
                    </span>
                    {e.errorMessage && (
                      <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                        {"— "}
                        {e.errorMessage.slice(0, 80)}
                        {e.errorMessage.length > 80 ? "…" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-baseline gap-3">
                    {durationText && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                        {durationText}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelative(e.startedAt, locale)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
