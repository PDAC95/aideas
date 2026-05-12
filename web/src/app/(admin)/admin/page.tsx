import { getTranslations } from "next-intl/server";
import {
  fetchAdminHomeKpis,
  fetchAdminHomeActivity,
} from "@/lib/admin/home-queries";
import { AdminHomeKpiCards } from "@/components/admin/home/admin-home-kpi-cards";
import { AdminHomeQuickLinks } from "@/components/admin/home/admin-home-quick-links";
import { AdminHomeActivityFeed } from "@/components/admin/home/admin-home-activity-feed";

/**
 * Admin Home — operational landing page.
 *
 * Sections, top-down:
 *   1. KPI grid (2x2)               — Plan 22-01
 *   2. Quick-link banner cards (2)  — Plan 22-02
 *   3. Activity feed (last 15-20)   — Plan 22-02
 *
 * Layout already gates auth via assertPlatformStaff (defense-in-depth) so
 * this page does NOT re-gate. SSR snapshot — no cache, no realtime
 * (CONTEXT.md). Both fetchers run in parallel via Promise.all.
 */
export default async function AdminHomePage() {
  const t = await getTranslations("admin.home");
  const tCommon = await getTranslations("common");

  const [kpis, activity] = await Promise.all([
    fetchAdminHomeKpis(),
    fetchAdminHomeActivity(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <AdminHomeKpiCards
        kpis={kpis}
        labels={{
          pendingRequests: t("kpis.pendingRequests"),
          inSetupAutomations: t("kpis.inSetupAutomations"),
          activeClients: t("kpis.activeClients"),
          signupsThisWeek: t("kpis.signupsThisWeek"),
        }}
      />

      <AdminHomeQuickLinks
        pendingRequestsBadge={kpis.pendingRequests}
        inSetupAutomationsBadge={kpis.inSetupAutomations}
        labels={{
          requestsTitle: t("quickLinks.requests.title"),
          requestsBody: t("quickLinks.requests.body"),
          automationsTitle: t("quickLinks.automations.title"),
          automationsBody: t("quickLinks.automations.body"),
        }}
      />

      <AdminHomeActivityFeed
        entries={activity}
        translations={{
          title: t("feed.title"),
          empty: t("feed.empty"),
          events: {
            request_created: t.raw(
              "feed.events.request_created"
            ) as string,
            automation_activated: t.raw(
              "feed.events.automation_activated"
            ) as string,
            new_signup: t.raw("feed.events.new_signup") as string,
          },
        }}
        time={(k) => tCommon(k)}
      />
    </div>
  );
}
