import { getTranslations } from "next-intl/server";

/**
 * Clients Admin placeholder. Phase 21 replaces this with the client list,
 * 360-degree detail, and internal notes.
 */
export default async function AdminClientsPage() {
  const t = await getTranslations("admin.placeholders.clients");
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("body")}</p>
    </div>
  );
}
