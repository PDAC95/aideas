import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchAutomationDetail } from "@/lib/dashboard/queries";
import { AutomationDetailHeader } from "@/components/dashboard/automation-detail-header";
import { AutomationKpiCards } from "@/components/dashboard/automation-kpi-cards";
import { ExecutionTimeline } from "@/components/dashboard/execution-timeline";

/**
 * WeeklyBarChart uses Recharts which requires browser APIs.
 * Must be imported via next/dynamic with { ssr: false }.
 */
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

interface AutomationDetailPageProps {
  params: Promise<{ id: string }>;
}

function buildTimeAgo(
  dateStr: string,
  nowMs: number,
  minutes: string,
  hours: string,
  days: string
): string {
  const seconds = Math.floor((nowMs - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600)
    return minutes.replace("{count}", String(Math.floor(seconds / 60)));
  if (seconds < 86400)
    return hours.replace("{count}", String(Math.floor(seconds / 3600)));
  return days.replace("{count}", String(Math.floor(seconds / 86400)));
}

export default async function AutomationDetailPage({
  params,
}: AutomationDetailPageProps) {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get org
  const orgId = await getOrgId(user.id);
  if (!orgId) {
    redirect("/dashboard");
  }

  // Read route params (Next.js 16 — params is a Promise)
  const { id } = await params;

  // Fetch automation detail data
  let detailData;
  try {
    detailData = await fetchAutomationDetail(id, orgId);
  } catch {
    notFound();
  }

  const { automation, executions, weeklyData, monthlyMetricCount, hoursSaved } =
    detailData;

  if (!automation) {
    notFound();
  }

  // Get translations
  const t = await getTranslations("dashboard.automations");
  const tHome = await getTranslations("dashboard.home");

  // Status labels
  const statusLabels: Record<string, string> = {
    active: t("status.active"),
    paused: t("status.paused"),
    in_setup: t("status.in_setup"),
    failed: t("status.failed"),
    pending_review: t("status.failed"), // fallback
    draft: t("status.failed"),
    archived: t("status.failed"),
  };

  // Pre-compute timeAgo strings (avoids passing functions across RSC boundaries)
  const nowMs = Date.now();
  const minutesTemplate = tHome("timeAgo.minutes", { count: 99 }).replace(
    "99",
    "{count}"
  );
  const hoursTemplate = tHome("timeAgo.hours", { count: 99 }).replace(
    "99",
    "{count}"
  );
  const daysTemplate = tHome("timeAgo.days", { count: 99 }).replace(
    "99",
    "{count}"
  );

  // Pre-compute duration labels
  const enrichedExecutions = executions.map((exec) => ({
    id: exec.id,
    status: exec.status,
    timeAgo: buildTimeAgo(exec.started_at, nowMs, minutesTemplate, hoursTemplate, daysTemplate),
    durationLabel:
      exec.duration_ms != null
        ? `${(exec.duration_ms / 1000).toFixed(1)}s`
        : "",
    errorMessage: exec.error_message,
  }));

  // Determine if in_setup
  const isInSetup = automation.status === "in_setup";

  // Format monthly price (cents -> "$99/mo" or "---")
  let formattedPrice = "---";
  if (!isInSetup && automation.template?.monthly_price != null) {
    const dollars = automation.template.monthly_price / 100;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(dollars);
    formattedPrice = `${formatted}/mo`;
  }

  // Header translations
  const headerTranslations = {
    pause: t("actions.pause"),
    resume: t("actions.resume"),
    cancel: t("actions.cancel"),
    pauseSuccess: t("actions.pauseSuccess"),
    resumeSuccess: t("actions.resumeSuccess"),
    cancelSuccess: t("actions.cancelSuccess"),
    cancelDialogTitle: t("cancelDialog.title"),
    cancelDialogDescription: t("cancelDialog.description"),
    cancelDialogBack: t("cancelDialog.back"),
    cancelDialogConfirm: t("cancelDialog.confirm"),
  };

  // Timeline translations
  const timelineTranslations = {
    title: t("detail.timeline.title"),
    empty: t("detail.timeline.empty"),
    success: t("detail.timeline.success"),
    error: t("detail.timeline.error"),
  };

  // Chart translations
  const chartTranslations = {
    title: t("detail.chart.title"),
    empty: t("detail.chart.empty"),
  };

  return (
    <div className="mt-4">
      {/* Back link */}
      <Link
        href="/dashboard/automations"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("detail.back")}
      </Link>

      {/* Header: name, category, apps, status badge, action buttons */}
      <AutomationDetailHeader
        automationId={automation.id}
        name={automation.name}
        status={automation.status}
        category={automation.template?.category ?? ""}
        connectedApps={automation.template?.connected_apps ?? null}
        statusLabel={statusLabels[automation.status] ?? automation.status}
        translations={headerTranslations}
      />

      {/* 3 KPI cards */}
      <div className="mt-6">
        <AutomationKpiCards
          metricCount={isInSetup ? "---" : monthlyMetricCount}
          metricLabel={automation.template?.activity_metric_label ?? ""}
          hoursSaved={isInSetup ? "---" : hoursSaved}
          hoursSavedLabel={t("detail.kpi.hoursSaved")}
          monthlyCharge={isInSetup ? "---" : formattedPrice}
          monthlyChargeLabel={t("detail.kpi.monthlyCharge")}
        />
      </div>

      {/* In-setup message OR timeline + chart */}
      {isInSetup ? (
        <div className="mt-6 rounded-xl border bg-white dark:bg-gray-800 p-8 text-center text-muted-foreground">
          {t("detail.setupMessage")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left: Execution Timeline */}
          <ExecutionTimeline
            executions={enrichedExecutions}
            translations={timelineTranslations}
          />
          {/* Right: Weekly Bar Chart (SSR-unsafe, loaded via dynamic import) */}
          <WeeklyBarChart
            data={weeklyData}
            translations={chartTranslations}
          />
        </div>
      )}
    </div>
  );
}
