import { getTranslations } from "next-intl/server";

/**
 * Requests Inbox placeholder. Phase 19 replaces this with the request list,
 * detail, and approve/reject flow.
 */
export default async function AdminRequestsPage() {
  const t = await getTranslations("admin.placeholders.requests");
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("body")}</p>
    </div>
  );
}
