"use client";

import dynamic from "next/dynamic";
import type { WeeklyChartData } from "@/lib/dashboard/types";

const WeeklyBarChart = dynamic(
  () =>
    import("@/components/dashboard/weekly-bar-chart").then((mod) => ({
      default: mod.WeeklyBarChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
    ),
  }
);

interface WeeklyBarChartLoaderProps {
  data: WeeklyChartData[];
  translations: {
    title: string;
    empty: string;
  };
}

export function WeeklyBarChartLoader({
  data,
  translations,
}: WeeklyBarChartLoaderProps) {
  return <WeeklyBarChart data={data} translations={translations} />;
}
