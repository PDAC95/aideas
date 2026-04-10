import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getOrgId, fetchDashboardData } from "@/lib/dashboard/queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { AutomationList } from "@/components/dashboard/automation-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

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
    // No org — could redirect to onboarding; for now show empty state
    redirect("/login");
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

  return (
    <div>
      {/* Greeting row */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Link
          href="/dashboard/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t("newAutomation")}
        </Link>
      </div>

      {/* KPI Cards — full width */}
      <KpiCards
        kpis={kpis}
        labels={{
          activeAutomations: t("kpi.activeAutomations"),
          tasksThisWeek: t("kpi.tasksThisWeek"),
          hoursSavedThisMonth: t("kpi.hoursSavedThisMonth"),
        }}
      />

      {/* 2-column layout: automations LEFT, activity feed RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AutomationList
          automations={automations}
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
        <ActivityFeed
          executions={enrichedExecutionsFinal}
          translations={{
            title: t("activityFeed.title"),
            viewAll: t("activityFeed.viewAll"),
            errorBadge: t("activityFeed.errorBadge"),
            noActivity: t("activityFeed.noActivity"),
          }}
        />
      </div>
    </div>
  );
}
