import { cn } from "@/lib/utils";

interface AdminAutomationKpisProps {
  totalExecutions: number;
  hoursSaved: number;
  successRate: number | null; // 0..1 or null
  lastRunAt: string | null; // ISO 8601 or null
  locale: string;
  translations: {
    totalExecutions: string;
    hoursSaved: string;
    successRate: string;
    lastExecution: string;
    never: string;
    notAvailable: string;
  };
}

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

const cardCls = cn(
  "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
  "dark:border-gray-700 dark:bg-gray-900"
);
const labelCls =
  "text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400";
const valueCls =
  "mt-1 text-2xl font-semibold text-gray-900 dark:text-white tabular-nums";

export function AdminAutomationKpis({
  totalExecutions,
  hoursSaved,
  successRate,
  lastRunAt,
  locale,
  translations,
}: AdminAutomationKpisProps) {
  const successRateText =
    successRate === null
      ? translations.notAvailable
      : `${Math.round(successRate * 100)}%`;
  const lastRunText = lastRunAt
    ? formatRelative(lastRunAt, locale)
    : translations.never;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className={cardCls}>
        <div className={labelCls}>{translations.totalExecutions}</div>
        <div className={valueCls}>
          {new Intl.NumberFormat(locale).format(totalExecutions)}
        </div>
      </div>
      <div className={cardCls}>
        <div className={labelCls}>{translations.hoursSaved}</div>
        <div className={valueCls}>
          {new Intl.NumberFormat(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(hoursSaved)}
        </div>
      </div>
      <div className={cardCls}>
        <div className={labelCls}>{translations.successRate}</div>
        <div className={valueCls}>{successRateText}</div>
      </div>
      <div className={cardCls}>
        <div className={labelCls}>{translations.lastExecution}</div>
        <div className="mt-1 text-base font-medium text-gray-900 dark:text-white">
          {lastRunText}
        </div>
      </div>
    </div>
  );
}
