"use client";

import dynamic from "next/dynamic";
import type { WeeklyChartData } from "@/lib/dashboard/types";

const ReportsWeeklyChart = dynamic(
  () =>
    import("@/components/dashboard/reports-weekly-chart").then((mod) => ({
      default: mod.ReportsWeeklyChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
    ),
  }
);

interface ReportsWeeklyChartLoaderProps {
  data: WeeklyChartData[];
  translations: {
    title: string;
    empty: string;
  };
}

export function ReportsWeeklyChartLoader({
  data,
  translations,
}: ReportsWeeklyChartLoaderProps) {
  return <ReportsWeeklyChart data={data} translations={translations} />;
}
