/**
 * ReportsWeeklyChart — Recharts-based bar chart for 8-week execution activity.
 * MUST be imported with next/dynamic({ ssr: false }) to avoid SSR hydration issues.
 */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyChartData } from "@/lib/dashboard/types";

interface ReportsWeeklyChartProps {
  data: WeeklyChartData[];
  translations: {
    title: string;
    empty: string;
  };
}

export function ReportsWeeklyChart({
  data,
  translations,
}: ReportsWeeklyChartProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">
        {translations.title}
      </h3>
      {isEmpty ? (
        <div className="flex items-center justify-center h-[240px] text-sm text-gray-400 dark:text-gray-500">
          {translations.empty}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
