import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchAutomationDetail } from "@/lib/dashboard/queries";
import { formatRelativeTime } from "@/lib/utils/time";
import { AutomationDetailHeader } from "@/components/dashboard/automation-detail-header";
import { AutomationKpiCards } from "@/components/dashboard/automation-kpi-cards";
import { ExecutionTimeline } from "@/components/dashboard/execution-timeline";
import { WeeklyBarChart } from "@/components/dashboard/weekly-bar-chart";

interface AutomationDetailPageProps {
  params: Promise<{ id: string }>;
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
  const tCommon = await getTranslations("common");
  const tTemplates = await getTranslations("templates");

  // Resolve i18n keys stored in template fields (activity_metric_label is a key like
  // "templates.content_generation.metric_label", not a literal string)
  const resolveTemplateKey = (key: string | null | undefined): string => {
    if (!key) return "";
    const stripped = key.startsWith("templates.") ? key.slice("templates.".length) : key;
    try {
      return tTemplates(stripped);
    } catch {
      return "";
    }
  };

  const resolvedMetricLabel = resolveTemplateKey(automation.template?.activity_metric_label);

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

  // Pre-compute timeAgo strings via shared helper (avoids passing functions across RSC boundaries)
  const enrichedExecutions = executions.map((exec) => ({
    id: exec.id,
    status: exec.status,
    timeAgo: formatRelativeTime(exec.started_at, tCommon),
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
    permissionError: t("actions.permissionError"),
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
          metricLabel={resolvedMetricLabel}
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
          {/* Right: Weekly Bar Chart (client island — "use client") */}
          <WeeklyBarChart
            data={weeklyData}
            translations={chartTranslations}
          />
        </div>
      )}
    </div>
  );
}
