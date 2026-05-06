import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchReportsData } from "@/lib/dashboard/queries";
import { ReportsPeriodSelector } from "@/components/dashboard/reports-period-selector";
import { ReportsKpiCards } from "@/components/dashboard/reports-kpi-cards";
import { ReportsWeeklyChartLoader } from "@/components/dashboard/reports-weekly-chart-loader";
import { ReportsBreakdownTable } from "@/components/dashboard/reports-breakdown-table";

const VALID_PERIODS = ["this_month", "last_month", "last_3_months"];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "this_month" } = await searchParams;
  const safePeriod = VALID_PERIODS.includes(period) ? period : "this_month";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const orgId = await getOrgId(user.id);
  if (!orgId) return null;

  const [data, t] = await Promise.all([
    fetchReportsData(orgId, safePeriod),
    getTranslations("dashboard.reports"),
  ]);

  const periodTranslations = {
    this_month: t("period.this_month"),
    last_month: t("period.last_month"),
    last_3_months: t("period.last_3_months"),
  };

  const kpiTranslations = {
    tasksCompleted: t("kpi.tasksCompleted"),
    hoursSaved: t("kpi.hoursSaved"),
    estimatedValue: t("kpi.estimatedValue"),
    vsLastPeriod: t("kpi.vsLastPeriod"),
    noHourlyCost: t("kpi.noHourlyCost"),
    settingsLink: t("kpi.settingsLink"),
  };

  const chartTranslations = {
    title: t("chart.title"),
    empty: t("chart.empty"),
  };

  const breakdownTranslations = {
    title: t("breakdown.title"),
    automationName: t("breakdown.automationName"),
    metricLabel: t("breakdown.metricLabel"),
    count: t("breakdown.count"),
    hoursSaved: t("breakdown.hoursSaved"),
    total: t("breakdown.total"),
    viewAll: t("breakdown.viewAll"),
    showLess: t("breakdown.showLess"),
  };

  const emptyTranslations = {
    title: t("empty.title"),
    message: t("empty.message"),
    cta: t("empty.cta"),
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-4">
          <BarChart3 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {emptyTranslations.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {emptyTranslations.message}
        </p>
        <Link
          href="/dashboard/automations"
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          {emptyTranslations.cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
      </div>

      <ReportsPeriodSelector
        currentPeriod={safePeriod}
        translations={periodTranslations}
      />

      <ReportsKpiCards
        kpi={data.kpi}
        hourlyCost={data.hourlyCost}
        translations={kpiTranslations}
      />

      <ReportsWeeklyChartLoader
        data={data.weeklyChart}
        translations={chartTranslations}
      />

      <ReportsBreakdownTable
        rows={data.breakdown}
        translations={breakdownTranslations}
      />
    </div>
  );
}
