import Link from "next/link";
import type { AdminClientDetail as AdminClientDetailData } from "@/lib/admin/types";

interface AdminClientDetailProps {
  detail: AdminClientDetailData;
  locale: string;
  translations: {
    backLink: string;
    header: {
      slugLabel: string;
      createdLabel: string;
      membersLabel: string;
      activeAutomationsLabel: string;
      pendingRequestsLabel: string;
    };
  };
  children: React.ReactNode; // tabs strip + active tab body
}

/**
 * Persistent header layout for /admin/clients/[id].
 *
 * Renders:
 *   - Back link to /admin/clients
 *   - Org name as page title
 *   - 5-cell stat grid: Slug (mono) / Created / # Members / # Active
 *     automations / # Pending requests
 *   - children slot for the tabs strip + active tab body
 *
 * Server component — uses Intl.DateTimeFormat at render time.
 */
export function AdminClientDetail({
  detail,
  locale,
  translations,
  children,
}: AdminClientDetailProps) {
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/clients"
        className="text-sm text-primary hover:underline dark:text-primary"
      >
        {translations.backLink}
      </Link>

      <header className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {detail.name}
        </h1>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {translations.header.slugLabel}
            </dt>
            <dd className="mt-1 font-mono text-gray-900 dark:text-white">
              {detail.slug}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {translations.header.createdLabel}
            </dt>
            <dd className="mt-1 text-gray-900 dark:text-white">
              {dateFmt.format(new Date(detail.createdAt))}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {translations.header.membersLabel}
            </dt>
            <dd className="mt-1 tabular-nums text-gray-900 dark:text-white">
              {detail.membersCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {translations.header.activeAutomationsLabel}
            </dt>
            <dd className="mt-1 tabular-nums text-gray-900 dark:text-white">
              {detail.activeAutomationsCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {translations.header.pendingRequestsLabel}
            </dt>
            <dd className="mt-1 tabular-nums text-gray-900 dark:text-white">
              {detail.pendingRequestsCount}
            </dd>
          </div>
        </dl>
      </header>

      {children}
    </div>
  );
}
