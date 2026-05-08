import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminClientAutomationRow } from "@/lib/admin/types";

interface AdminClientAutomationsTabProps {
  rows: AdminClientAutomationRow[];
  orgSlug: string;
  locale: string;
  translations: {
    columns: {
      name: string;
      status: string;
      template: string;
      createdAt: string;
      lastRun: string;
    };
    statusBadges: Record<string, string>;
    noTemplate: string;
    neverRun: string;
    empty: string;
    viewAll: string;
  };
}

/**
 * Phase 20 status palette mapping — keep visual parity with /admin/automations.
 * Unknown statuses fall back to the draft palette (gray) for forward-compat.
 */
const STATUS_BADGE_CLASSES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending_review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  in_setup:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  paused:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

/**
 * Server-rendered Automations tab body for /admin/clients/[id].
 *
 * Each row is a clickable link to /admin/automations/[id] (Phase 20 detail
 * page). Footer "View all" link drops the user on /admin/automations filtered
 * by ?org=<slug>.
 */
export function AdminClientAutomationsTab({
  rows,
  orgSlug,
  locale,
  translations,
}: AdminClientAutomationsTabProps) {
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
                {translations.columns.name}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.status}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.template}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.createdAt}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                {translations.columns.lastRun}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {rows.map((row) => {
              const badgeClass =
                STATUS_BADGE_CLASSES[row.status] ?? STATUS_BADGE_CLASSES.draft;
              const statusLabel =
                translations.statusBadges[row.status] ?? row.status;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/automations/${row.id}`}
                      className="font-medium text-purple-700 hover:underline dark:text-purple-300"
                    >
                      {row.name}
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
                    {row.templateDisplayName ?? translations.noTemplate}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {dateFmt.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.lastRunAt
                      ? dateFmt.format(new Date(row.lastRunAt))
                      : translations.neverRun}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link
        href={`/admin/automations?org=${encodeURIComponent(orgSlug)}`}
        className="inline-block text-sm text-purple-700 hover:underline dark:text-purple-300"
      >
        {translations.viewAll}
      </Link>
    </div>
  );
}
