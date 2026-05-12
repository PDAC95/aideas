import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminClientRequestRow } from "@/lib/admin/types";

interface AdminClientRequestsTabProps {
  rows: AdminClientRequestRow[];
  orgSlug: string;
  locale: string;
  translations: {
    columns: {
      title: string;
      status: string;
      submittedBy: string;
      createdAt: string;
    };
    statusBadges: Record<string, string>;
    empty: string;
    viewAll: string;
  };
}

/**
 * Phase 19 status palette — keep visual parity with /admin/requests. Unknown
 * statuses fall back to a neutral gray for forward-compat.
 */
const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  in_review:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  payment_pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  payment_failed:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const FALLBACK_BADGE_CLASS =
  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

/**
 * Server-rendered Requests tab body for /admin/clients/[id].
 *
 * Each row is a clickable link to /admin/requests/[id] (Phase 19 detail
 * page). Footer "View all" link drops the user on /admin/requests filtered by
 * ?org=<slug>.
 */
export function AdminClientRequestsTab({
  rows,
  orgSlug,
  locale,
  translations,
}: AdminClientRequestsTabProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {translations.empty}
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.title}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.status}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.submittedBy}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.createdAt}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {rows.map((row) => {
              const badgeClass =
                STATUS_BADGE_CLASSES[row.status] ?? FALLBACK_BADGE_CLASS;
              const statusLabel =
                translations.statusBadges[row.status] ?? row.status;
              const submitter =
                row.submittedByFullName ?? row.submittedByEmail;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/requests/${row.id}`}
                      className="font-medium text-purple-700 hover:underline dark:text-purple-300"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        badgeClass
                      )}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {submitter}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {dateFmt.format(new Date(row.createdAt))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link
        href={`/admin/requests?org=${encodeURIComponent(orgSlug)}`}
        className="inline-block text-sm text-purple-700 hover:underline dark:text-purple-300"
      >
        {translations.viewAll}
      </Link>
    </div>
  );
}
