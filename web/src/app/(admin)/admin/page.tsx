import { getTranslations } from "next-intl/server";
import { fetchAdminHomeKpis } from "@/lib/admin/home-queries";
import { AdminHomeKpiCards } from "@/components/admin/home/admin-home-kpi-cards";

/**
 * Admin Home — operational landing page.
 *
 * Phase 22 Plan 22-01: 4 KPI cards.
 * Phase 22 Plan 22-02 will add: activity feed + quick-link cards.
 *
 * Layout gates auth via assertPlatformStaff (defense-in-depth) so this page
 * does NOT re-gate. Data is freshly fetched on every request (no cache, no
 * realtime — per CONTEXT.md "SSR snapshot on each page load").
 */
export default async function AdminHomePage() {
  const t = await getTranslations("admin.home");
  const kpis = await fetchAdminHomeKpis();

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
    </div>
  );
}
