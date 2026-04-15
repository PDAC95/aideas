"use client";

import { useRouter, usePathname } from "next/navigation";

interface ReportsPeriodSelectorProps {
  currentPeriod: string;
  translations: {
    this_month: string;
    last_month: string;
    last_3_months: string;
  };
}

const PERIODS = ["this_month", "last_month", "last_3_months"] as const;

export function ReportsPeriodSelector({
  currentPeriod,
  translations,
}: ReportsPeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handlePeriodClick(period: string) {
    router.push(`${pathname}?period=${period}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
      {PERIODS.map((period) => {
        const isActive = currentPeriod === period;
        return (
          <button
            key={period}
            onClick={() => handlePeriodClick(period)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              isActive
                ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {translations[period]}
          </button>
        );
      })}
    </div>
  );
}
