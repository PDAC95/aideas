"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { ReportsKpi } from "@/lib/dashboard/types";

interface ReportsKpiCardsProps {
  kpi: ReportsKpi;
  hourlyCost: number | null;
  translations: {
    tasksCompleted: string;
    hoursSaved: string;
    estimatedValue: string;
    vsLastPeriod: string;
    noHourlyCost: string;
    settingsLink: string;
  };
}

interface ChangeIndicatorProps {
  change: number | null;
  vsLastPeriod: string;
}

function ChangeIndicator({ change, vsLastPeriod }: ChangeIndicatorProps) {
  if (change === null) {
    return <span className="text-sm text-gray-400 dark:text-gray-500">—</span>;
  }

  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>
        {isPositive ? "+" : ""}
        {change}% {vsLastPeriod}
      </span>
    </div>
  );
}

export function ReportsKpiCards({
  kpi,
  hourlyCost,
  translations,
}: ReportsKpiCardsProps) {
  const formattedTasks = new Intl.NumberFormat().format(kpi.tasksCompleted);
  const formattedHours = kpi.hoursSaved.toFixed(1);
  const formattedValue =
    kpi.estimatedValue != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(kpi.estimatedValue)
      : "--";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Tasks Completed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2.5 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formattedTasks}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {translations.tasksCompleted}
            </p>
            <div className="mt-2">
              <ChangeIndicator
                change={kpi.tasksChange}
                vsLastPeriod={translations.vsLastPeriod}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hours Saved */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2.5 shrink-0">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formattedHours}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {translations.hoursSaved}
            </p>
            <div className="mt-2">
              <ChangeIndicator
                change={kpi.hoursChange}
                vsLastPeriod={translations.vsLastPeriod}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Value */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2.5 shrink-0">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formattedValue}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {translations.estimatedValue}
            </p>
            {hourlyCost === null ? (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {translations.noHourlyCost}
                </p>
                <Link
                  href="/dashboard/settings"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {translations.settingsLink}
                </Link>
              </div>
            ) : (
              <div className="mt-2">
                <ChangeIndicator
                  change={kpi.valueChange}
                  vsLastPeriod={translations.vsLastPeriod}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
