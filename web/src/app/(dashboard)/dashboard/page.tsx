import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getOrgId, fetchDashboardData } from "@/lib/dashboard/queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { AutomationList } from "@/components/dashboard/automation-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopAutomationCard } from "@/components/dashboard/top-automation-card";
import { AutomationSuccessRate } from "@/components/dashboard/automation-success-rate";
import { AutomationPerformance } from "@/components/dashboard/automation-performance";

function buildTimeAgo(
  dateStr: string,
  now: string,
  minutes: string,
  hours: string,
  days: string
): string {
  const seconds = Math.floor(
    (new Date(now).getTime() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return now; // "Just now" — reuse the now label
  if (seconds < 3600)
    return minutes.replace("{count}", String(Math.floor(seconds / 60)));
  if (seconds < 86400)
    return hours.replace("{count}", String(Math.floor(seconds / 3600)));
  return days.replace("{count}", String(Math.floor(seconds / 86400)));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("dashboard.home");

  // Get org
  const orgId = await getOrgId(user.id);
  if (!orgId) {
    // No org — show empty state instead of redirecting (avoids redirect loop)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("greetingFallback")}
        </h1>
        <p className="text-muted-foreground">
          {t("noOrganization")}
        </p>
      </div>
    );
  }

  const { automations, executions, kpis } = await fetchDashboardData(
    user.id,
    orgId
  );

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "greetingMorning"
      : hour < 18
        ? "greetingAfternoon"
        : "greetingEvening";
  const firstName = (user.user_metadata?.first_name as string) || "";
  const greeting = firstName
    ? t(greetingKey, { name: firstName })
    : t("greetingFallback");

  // Pre-compute time-ago strings for each execution (avoids passing functions across RSC boundaries)
  const nowIso = new Date().toISOString();
  const nowLabel = t("timeAgo.now");
  const minutesTemplate = t("timeAgo.minutes", { count: 99 }).replace(
    "99",
    "{count}"
  );
  const hoursTemplate = t("timeAgo.hours", { count: 99 }).replace(
    "99",
    "{count}"
  );
  const daysTemplate = t("timeAgo.days", { count: 99 }).replace(
    "99",
    "{count}"
  );

  const enrichedExecutions = executions.map((exec) => ({
    id: exec.id,
    automationName: exec.automation.name,
    status: exec.status,
    errorMessage: exec.error_message,
    timeAgo: buildTimeAgo(
      exec.started_at,
      nowIso,
      minutesTemplate,
      hoursTemplate,
      daysTemplate
    ),
  }));

  // Fix "Just now" — buildTimeAgo returns nowIso for <60s, replace with label
  const enrichedExecutionsFinal = enrichedExecutions.map((e) => ({
    ...e,
    timeAgo: e.timeAgo === nowIso ? nowLabel : e.timeAgo,
  }));

  // Status labels for automation list
  const statusLabels: Record<string, string> = {
    active: t("status.active"),
    paused: t("status.paused"),
    failed: t("status.failed"),
    in_setup: t("status.in_setup"),
    pending_review: t("status.pending_review"),
    draft: t("status.draft"),
    archived: t("status.archived"),
  };

  // Top automation — sort by daily_execution_count descending, pick first
  const sortedAutomations = [...automations].sort(
    (a, b) => b.daily_execution_count - a.daily_execution_count
  );
  const topAutomation = sortedAutomations[0] ?? null;

  // Success rate — from all executions in the fetched set
  const totalExecs = executions.length;
  const successExecs = executions.filter((e) => e.status === "success").length;
  const successRate =
    totalExecs > 0 ? Math.round((successExecs / totalExecs) * 100) : 0;

  // KPI trends — hardcoded as "+12%" for now since we don't have historical comparison data yet
  // TODO: compute real trends when weekly snapshot data is available
  const kpiTrends = {
    activeAutomations: "+12%",
    tasksThisWeek: "+8%",
    hoursSavedThisMonth: "+15%",
  };

  // Performance metrics
  const avgResponseTime = "< 1 min"; // placeholder — real value needs execution duration tracking
  const performanceMetrics = [
    { label: t("performance.avgResponseTime"), value: avgResponseTime },
    { label: t("performance.totalExecutions"), value: String(totalExecs) },
    { label: t("performance.successRate"), value: `${successRate}%` },
    {
      label: t("performance.activeAutomations"),
      value: String(kpis.activeAutomations),
    },
  ];

  return (
    <div>
      {/* Row 1: Greeting */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href="/dashboard/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t("newAutomation")}
        </Link>
      </div>

      {/* Row 2: KPI Cards (2/3) + Top Automation Card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <KpiCards
            kpis={kpis}
            labels={{
              activeAutomations: t("kpi.activeAutomations"),
              tasksThisWeek: t("kpi.tasksThisWeek"),
              hoursSavedThisMonth: t("kpi.hoursSavedThisMonth"),
            }}
            trends={kpiTrends}
          />
        </div>
        <TopAutomationCard
          automationName={topAutomation?.name ?? ""}
          executionCount={topAutomation?.daily_execution_count ?? 0}
          statusLabel={
            topAutomation
              ? (statusLabels[topAutomation.status] ?? topAutomation.status)
              : ""
          }
          translations={{
            title: t("topAutomation.title"),
            executions: t("topAutomation.executions"),
            status: t("topAutomation.status"),
          }}
        />
      </div>

      {/* Row 3: Top Automations (left) + Success Rate + Performance (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AutomationList
          automations={sortedAutomations}
          rankByExecutions={true}
          translations={{
            title: t("automationList.title"),
            viewAll: t("automationList.viewAll"),
            dailyMetric: t("automationList.dailyMetric", { count: 99 }).replace(
              "99",
              "{count}"
            ),
            noRuns: t("automationList.noRuns"),
            newAutomation: t("newAutomation"),
            statusLabels,
          }}
        />
        <div className="flex flex-col gap-6">
          <AutomationSuccessRate
            rate={successRate}
            trend="+5%"
            translations={{
              title: t("successRate.title"),
              trendLabel: t("successRate.trendLabel"),
            }}
          />
          <AutomationPerformance
            metrics={performanceMetrics}
            translations={{ title: t("performance.title") }}
          />
        </div>
      </div>

      {/* Row 4: Activity Feed — full width */}
      <div className="mt-6">
        <ActivityFeed
          executions={enrichedExecutionsFinal}
          translations={{
            title: t("activityFeed.title"),
            viewAll: t("activityFeed.viewAll"),
            errorBadge: t("activityFeed.errorBadge"),
            noActivity: t("activityFeed.noActivity"),
            statusLabels: {
              success: t("activityFeed.statusLabels.success"),
              error: t("activityFeed.statusLabels.error"),
              running: t("activityFeed.statusLabels.running"),
              cancelled: t("activityFeed.statusLabels.cancelled"),
            },
          }}
        />
      </div>
    </div>
  );
}
