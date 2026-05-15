import Link from "next/link";
import type { AdminClientRow } from "@/lib/admin/types";

interface AdminClientsTableProps {
  rows: AdminClientRow[];
  locale: string;
  hasQuery: boolean;
  translations: {
    columns: {
      name: string;
      slug: string;
      activeAutomations: string;
      members: string;
      createdAt: string;
    };
    empty: {
      noResults: string;
      noOrgs: string;
    };
  };
}

export function AdminClientsTable({
  rows,
  locale,
  hasQuery,
  translations,
}: AdminClientsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {hasQuery ? translations.empty.noResults : translations.empty.noOrgs}
      </div>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.name}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.slug}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.activeAutomations}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.members}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.createdAt}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-3 text-sm">
                <Link
                  href={`/admin/clients/${row.id}`}
                  className="font-medium text-primary hover:underline dark:text-primary"
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                {row.slug}
              </td>
              <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-900 dark:text-white">
                {row.activeAutomationsCount}
              </td>
              <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-900 dark:text-white">
                {row.membersCount}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {dateFormatter.format(new Date(row.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
