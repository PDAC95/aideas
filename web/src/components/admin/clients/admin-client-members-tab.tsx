import { cn } from "@/lib/utils";
import type { AdminClientMember } from "@/lib/admin/types";

interface AdminClientMembersTabProps {
  rows: AdminClientMember[];
  locale: string;
  translations: {
    columns: {
      email: string;
      fullName: string;
      role: string;
      lastLogin: string;
      joined: string;
    };
    /**
     * Role labels keyed by raw role string. MUST include "owner" because
     * handle_new_user() trigger
     * (supabase/migrations/20260401000001_user_registration.sql) creates the
     * first organization_members row per org with role='owner'. Skipping
     * "owner" would render the most common role untranslated.
     */
    roles: Record<string, string>;
    noFullName: string;
    neverLoggedIn: string;
    inactive: string;
    empty: string;
  };
}

/**
 * Read-only Members tab body for /admin/clients/[id].
 *
 * Per CONTEXT.md "Read-only — no remove/invite actions in this phase".
 * Renders 5 columns: Email | Full name | Role | Last login | Joined. Inactive
 * members render with opacity-60 + a chip after the email; the row is NOT
 * clickable.
 */
export function AdminClientMembersTab({
  rows,
  locale,
  translations,
}: AdminClientMembersTabProps) {
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
  const dateTimeFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.email}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.fullName}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.role}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.lastLogin}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              {translations.columns.joined}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {rows.map((row) => {
            // Forward-compat: if role string is not in the translation map,
            // render the raw role (e.g. a future role added at the DB level
            // but not yet in i18n).
            const roleLabel = translations.roles[row.role] ?? row.role;
            return (
              <tr
                key={row.userId}
                className={cn(!row.isActive && "opacity-60")}
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {row.email}
                  {!row.isActive && (
                    <span className="ml-2 inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {translations.inactive}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {row.fullName ?? translations.noFullName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {roleLabel}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {row.lastSignInAt
                    ? dateTimeFmt.format(new Date(row.lastSignInAt))
                    : translations.neverLoggedIn}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {dateFmt.format(new Date(row.joinedAt))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
