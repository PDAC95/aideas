import { getTranslations } from "next-intl/server";

/**
 * Automations Admin placeholder. Phase 20 replaces this with the global
 * cross-org automation list and status transitions.
 */
export default async function AdminAutomationsPage() {
  const t = await getTranslations("admin.placeholders.automations");
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("body")}</p>
    </div>
  );
}
