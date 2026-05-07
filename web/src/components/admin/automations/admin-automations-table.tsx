import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AdminAutomationRow } from "@/lib/admin/types";

interface AdminAutomationsTableProps {
  rows: AdminAutomationRow[];
  locale: string;
  translations: {
    columns: {
      name: string;
      customer: string;
      template: string;
      status: string;
      executions: string;
      createdAt: string;
    };
    statusBadges: {
      active: string;
      in_setup: string;
      paused: string;
      failed: string;
      archived: string;
      draft: string;
      pending_review: string;
    };
    empty: string;
    noTemplate: string;
  };
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  in_setup: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  archived: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  pending_review:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
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
 * Server-rendered 6-column table for the admin Automations list. No client
 * state — interactivity is provided exclusively by `<Link>` elements that
 * point at /admin/automations/[id]. Empty state is a single localized string;
 * the parent picks which empty-state copy applies based on the active tab.
 *
 * Renders 7 status badges (5 tabbed + draft + pending_review) so even
 * non-tabbed rows render correctly if a row sneaks through.
 */
export function AdminAutomationsTable({
  rows,
  locale,
  translations,
}: AdminAutomationsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {translations.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300"
            >
              {translations.columns.name}
            </th>
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
              className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              {translations.columns.executions}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              {translations.columns.createdAt}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row) => {
            const statusKey =
              row.status as keyof typeof translations.statusBadges;
            const badgeLabel =
              translations.statusBadges[statusKey] ?? row.status;
            const badgeCls =
              STATUS_BADGE_CLASS[row.status] ?? STATUS_BADGE_CLASS.draft;
            return (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/automations/${row.id}`}
                    className="font-medium text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                  {row.organizationName}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                  {row.templateId
                    ? row.templateDisplayName ?? translations.noTemplate
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
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 tabular-nums">
                  {row.executionsCount}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
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
