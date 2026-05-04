/**
 * WeeklyBarChart — Recharts-based bar chart for weekly execution counts.
 * Client component ("use client") — import directly from RSC consumers.
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

interface WeeklyBarChartProps {
  data: WeeklyChartData[];
  translations: {
    title: string;
    empty: string;
  };
}

export function WeeklyBarChart({ data, translations }: WeeklyBarChartProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
        {translations.title}
      </h3>
      {isEmpty ? (
        <div className="flex items-center justify-center h-[200px] text-sm text-gray-400 dark:text-gray-500">
          {translations.empty}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
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
