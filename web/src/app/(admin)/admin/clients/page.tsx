import { getLocale, getTranslations } from "next-intl/server";
import { fetchAdminClients } from "@/lib/admin/client-queries";
import { AdminClientsSearch } from "@/components/admin/clients/admin-clients-search";
import { AdminClientsTable } from "@/components/admin/clients/admin-clients-table";
import { AdminClientsPagination } from "@/components/admin/clients/admin-clients-pagination";

interface AdminClientsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 25;

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function nullify(raw: string | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  return t.length === 0 ? null : t;
}

/**
 * /admin/clients — global organizations list (CLNT-01 + CLNT-02).
 * Default sort = created_at DESC. 25 rows per page. ?q= ILIKE on (name OR slug).
 */
export default async function AdminClientsPage({
  searchParams,
}: AdminClientsPageProps) {
  const sp = await searchParams;
  const q = nullify(sp.q);
  const page = parsePage(sp.page);
  const locale = await getLocale();

  const [result, t] = await Promise.all([
    fetchAdminClients({ q, page, pageSize: PAGE_SIZE }),
    getTranslations("admin.clients.list"),
  ]);

  const tableTranslations = {
    columns: {
      name: t("columns.name"),
      slug: t("columns.slug"),
      activeAutomations: t("columns.activeAutomations"),
      members: t("columns.members"),
      createdAt: t("columns.createdAt"),
    },
    empty: {
      noResults: t("empty.noResults"),
      noOrgs: t("empty.noOrgs"),
    },
  };

  const searchTranslations = {
    label: t("search.label"),
    placeholder: t("search.placeholder"),
    clear: t("search.clear"),
  };

  const paginationTranslations = {
    label: t.raw("pagination.label") as string,
    previous: t("pagination.previous"),
    next: t("pagination.next"),
    page: t.raw("pagination.page") as string,
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

      <AdminClientsSearch
        initialQuery={q ?? ""}
        translations={searchTranslations}
      />
      <AdminClientsTable
        rows={result.rows}
        locale={locale}
        hasQuery={q !== null}
        translations={tableTranslations}
      />
      <AdminClientsPagination
        page={result.page}
        pageSize={result.pageSize}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        translations={paginationTranslations}
      />
    </div>
  );
}
