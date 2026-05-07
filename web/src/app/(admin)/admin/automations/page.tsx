import { getLocale, getTranslations } from "next-intl/server";
import {
  fetchAdminAutomations,
  fetchAdminAutomationStatusCounts,
  fetchAdminAutomationFilterOptions,
} from "@/lib/admin/automation-queries";
import { ADMIN_AUTOMATION_TABS } from "@/lib/admin/types";
import type { AdminAutomationTab } from "@/lib/admin/types";
import { AdminAutomationsTabs } from "@/components/admin/automations/admin-automations-tabs";
import { AdminAutomationsFilters } from "@/components/admin/automations/admin-automations-filters";
import { AdminAutomationsTable } from "@/components/admin/automations/admin-automations-table";

interface AdminAutomationsPageProps {
  searchParams: Promise<{
    status?: string;
    org?: string;
    template?: string;
    q?: string;
  }>;
}

function coerceTab(raw: string | undefined): AdminAutomationTab {
  if (raw && (ADMIN_AUTOMATION_TABS as readonly string[]).includes(raw)) {
    return raw as AdminAutomationTab;
  }
  return "active";
}

function nullify(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  return t.length === 0 ? null : t;
}

/**
 * Admin Automations — global cross-org list view (AUTM-01).
 * Default tab = active; ordering = created_at DESC for every tab.
 * Tabs + filters URL-synced via ?status=, ?org=, ?template=, ?q=.
 */
export default async function AdminAutomationsPage({
  searchParams,
}: AdminAutomationsPageProps) {
  const locale = await getLocale();
  const sp = await searchParams;
  const tab = coerceTab(sp.status);
  const organizationId = nullify(sp.org);
  const templateId = nullify(sp.template);
  const nameQuery = nullify(sp.q);

  const [rows, counts, filterOptions, t] = await Promise.all([
    fetchAdminAutomations({
      tab,
      organizationId,
      templateId,
      nameQuery,
      locale,
    }),
    fetchAdminAutomationStatusCounts(),
    fetchAdminAutomationFilterOptions({ locale }),
    getTranslations("admin.automations.list"),
  ]);

  const tabsTranslations = {
    active: t.raw("tabs.active") as string,
    in_setup: t.raw("tabs.in_setup") as string,
    paused: t.raw("tabs.paused") as string,
    failed: t.raw("tabs.failed") as string,
    archived: t.raw("tabs.archived") as string,
  };

  const filterTranslations = {
    orgLabel: t("filters.orgLabel"),
    orgAll: t("filters.orgAll"),
    templateLabel: t("filters.templateLabel"),
    templateAll: t("filters.templateAll"),
    searchLabel: t("filters.searchLabel"),
    searchPlaceholder: t("filters.searchPlaceholder"),
  };

  const tableTranslations = {
    columns: {
      name: t("columns.name"),
      customer: t("columns.customer"),
      template: t("columns.template"),
      status: t("columns.status"),
      executions: t("columns.executions"),
      createdAt: t("columns.createdAt"),
    },
    statusBadges: {
      active: t("statusBadges.active"),
      in_setup: t("statusBadges.in_setup"),
      paused: t("statusBadges.paused"),
      failed: t("statusBadges.failed"),
      archived: t("statusBadges.archived"),
      draft: t("statusBadges.draft"),
      pending_review: t("statusBadges.pending_review"),
    },
    empty: t(
      `empty.${tab}` as
        | "empty.active"
        | "empty.in_setup"
        | "empty.paused"
        | "empty.failed"
        | "empty.archived"
    ),
    noTemplate: t("noTemplate"),
  };

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

      <AdminAutomationsTabs
        active={tab}
        counts={counts}
        translations={tabsTranslations}
      />

      <AdminAutomationsFilters
        orgs={filterOptions.orgs}
        templates={filterOptions.templates}
        initial={{
          org: organizationId,
          template: templateId,
          q: nameQuery,
        }}
        translations={filterTranslations}
      />

      <AdminAutomationsTable
        rows={rows}
        locale={locale}
        translations={tableTranslations}
      />
    </div>
  );
}
