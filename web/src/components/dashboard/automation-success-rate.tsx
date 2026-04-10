import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationSuccessRateProps {
  rate: number;
  trend: string;
  translations: {
    title: string;
    trendLabel: string;
  };
}

export function AutomationSuccessRate({
  rate,
  trend,
  translations,
}: AutomationSuccessRateProps) {
  const isDown = trend.startsWith("-");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-base font-semibold text-gray-900 dark:text-white">
        {translations.title}
      </p>

      <div className="flex flex-col items-center justify-center py-4 gap-2">
        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
          {rate === 0 ? "—" : `${rate}%`}
        </p>

        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isDown
              ? "text-red-500 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isDown ? (
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>
            {trend} {translations.trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
