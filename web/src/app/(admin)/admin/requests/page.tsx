import { getLocale, getTranslations } from "next-intl/server";
import {
  fetchAdminRequests,
  fetchAdminRequestStatusCounts,
} from "@/lib/admin/request-queries";
import type { AdminRequestTab } from "@/lib/admin/types";
import { AdminRequestsTabs } from "@/components/admin/requests/admin-requests-tabs";
import { AdminRequestsTable } from "@/components/admin/requests/admin-requests-table";
import { AdminOrgFilterChip } from "@/components/admin/admin-org-filter-chip";

interface AdminRequestsPageProps {
  searchParams: Promise<{ status?: string; org?: string }>;
}

const VALID_TABS: AdminRequestTab[] = ["pending", "approved", "rejected"];

function coerceTab(raw: string | undefined): AdminRequestTab {
  if (raw && (VALID_TABS as string[]).includes(raw)) {
    return raw as AdminRequestTab;
  }
  return "pending";
}

function nullify(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  return t.length === 0 ? null : t;
}

/**
 * Admin Requests Inbox - list view (REQS-01).
 *
 * Pending tab is the default; ordering is FIFO for pending, DESC otherwise
 * (enforced server-side in fetchAdminRequests). Tabs persist via ?status= so
 * the route is shareable and refresh-stable.
 *
 * Tab labels are read via t.raw because they contain a {count} placeholder
 * that the client tabs component substitutes at render time using the live
 * counts; reading them via t() here would burn a translation call per render
 * with values we discard.
 *
 * Org filter (Phase 23, CLNT-04): `?org=<slug-or-uuid>` flows through
 * `fetchAdminRequests` via `orgIdentifier`. The query layer resolves the
 * identifier and returns an envelope `{ rows, orgFilter }` so this page can
 * render the filter chip without a second org-lookup query.
 */
export default async function AdminRequestsPage({
  searchParams,
}: AdminRequestsPageProps) {
  const locale = await getLocale();
  const sp = await searchParams;
  const tab = coerceTab(sp.status);
  const orgIdentifier = nullify(sp.org);

  const [requestsResult, counts, t] = await Promise.all([
    fetchAdminRequests({ tab, locale, orgIdentifier }),
    fetchAdminRequestStatusCounts(),
    getTranslations("admin.requests.list"),
  ]);
  const { rows, orgFilter } = requestsResult;

  const translations = {
    tabs: {
      pending: t.raw("tabs.pending") as string,
      approved: t.raw("tabs.approved") as string,
      rejected: t.raw("tabs.rejected") as string,
    },
    columns: {
      customer: t("columns.customer"),
      template: t("columns.template"),
      status: t("columns.status"),
      customRequirements: t("columns.customRequirements"),
      createdAt: t("columns.createdAt"),
    },
    statusBadges: {
      pending: t("statusBadges.pending"),
      in_review: t("statusBadges.in_review"),
      approved: t("statusBadges.approved"),
      completed: t("statusBadges.completed"),
      rejected: t("statusBadges.rejected"),
      payment_pending: t("statusBadges.payment_pending"),
      payment_failed: t("statusBadges.payment_failed"),
    },
    empty: t(
      `empty.${tab}` as "empty.pending" | "empty.approved" | "empty.rejected"
    ),
    noTemplate: t("noTemplate"),
    noRequirements: t("noRequirements"),
  };

  const orgFilterTranslations = {
    label: t("orgFilter.label"),
    clear: t("orgFilter.clear"),
    notFound: t("orgFilter.notFound", {
      value: orgFilter.orgIdentifierProvided ?? "",
    }),
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

      <AdminRequestsTabs
        active={tab}
        counts={counts}
        translations={translations.tabs}
      />

      <AdminOrgFilterChip
        orgFilter={orgFilter}
        currentSearchParams={sp}
        basePath="/admin/requests"
        translations={orgFilterTranslations}
      />

      <AdminRequestsTable
        rows={rows}
        locale={locale}
        translations={{
          columns: translations.columns,
          statusBadges: translations.statusBadges,
          empty: translations.empty,
          noTemplate: translations.noTemplate,
          noRequirements: translations.noRequirements,
        }}
      />
    </div>
  );
}
