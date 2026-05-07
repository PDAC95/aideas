import { getLocale, getTranslations } from "next-intl/server";
import {
  fetchAdminRequests,
  fetchAdminRequestStatusCounts,
} from "@/lib/admin/request-queries";
import type { AdminRequestStatus } from "@/lib/admin/types";
import { AdminRequestsTabs } from "@/components/admin/requests/admin-requests-tabs";
import { AdminRequestsTable } from "@/components/admin/requests/admin-requests-table";

interface AdminRequestsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const VALID_STATUSES: AdminRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
];

function coerceStatus(raw: string | undefined): AdminRequestStatus {
  if (raw && (VALID_STATUSES as string[]).includes(raw)) {
    return raw as AdminRequestStatus;
  }
  return "pending";
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
 */
export default async function AdminRequestsPage({
  searchParams,
}: AdminRequestsPageProps) {
  const locale = await getLocale();
  const { status: rawStatus } = await searchParams;
  const status = coerceStatus(rawStatus);

  const [rows, counts, t] = await Promise.all([
    fetchAdminRequests({ status, locale }),
    fetchAdminRequestStatusCounts(),
    getTranslations("admin.requests.list"),
  ]);

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
      approved: t("statusBadges.approved"),
      rejected: t("statusBadges.rejected"),
    },
    empty: t(
      `empty.${status}` as "empty.pending" | "empty.approved" | "empty.rejected"
    ),
    noTemplate: t("noTemplate"),
    noRequirements: t("noRequirements"),
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
        active={status}
        counts={counts}
        translations={translations.tabs}
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
