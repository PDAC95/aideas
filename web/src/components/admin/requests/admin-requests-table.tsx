import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminRequestRow, AdminRequestStatus } from "@/lib/admin/types";

interface AdminRequestsTableProps {
  rows: AdminRequestRow[];
  locale: string;
  translations: {
    columns: {
      customer: string;
      template: string;
      status: string;
      customRequirements: string;
      createdAt: string;
    };
    statusBadges: Record<AdminRequestStatus, string>;
    empty: string;
    noTemplate: string;
    noRequirements: string;
  };
}

/**
 * Badge color per REAL DB status value (not per tab). A row in the Pending
 * tab might be `in_review` or `payment_failed`; the badge reflects that.
 */
const STATUS_BADGE_CLASS: Record<AdminRequestStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  in_review:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  payment_pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  payment_failed:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

/**
 * Server-rendered 5-column table for the admin Requests Inbox. No client
 * state — interactivity is provided exclusively by `<Link>` elements that
 * point at /admin/requests/[id]. Empty state is a single localized string;
 * the parent picks which empty-state copy applies based on the active tab.
 */
export function AdminRequestsTable({
  rows,
  locale,
  translations,
}: AdminRequestsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {translations.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.customer}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.template}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.status}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.customRequirements}
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.createdAt}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row) => {
            const badgeLabel =
              translations.statusBadges[row.status] ?? row.status;
            const badgeCls =
              STATUS_BADGE_CLASS[row.status] ?? STATUS_BADGE_CLASS.pending;
            return (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/requests/${row.id}`}
                    className="font-medium text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
                  >
                    {row.organizationName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                  {row.templateId
                    ? row.templateDisplayName
                    : translations.noTemplate}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      badgeCls
                    )}
                  >
                    {badgeLabel}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600 dark:text-gray-300">
                  <Link
                    href={`/admin/requests/${row.id}`}
                    className="hover:underline"
                  >
                    {row.customRequirementsPreview ||
                      translations.noRequirements}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                  {formatDate(row.createdAt, locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
