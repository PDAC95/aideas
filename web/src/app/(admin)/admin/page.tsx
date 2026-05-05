import { getTranslations } from "next-intl/server";

/**
 * Admin Home placeholder.
 *
 * Phase 22 (Admin Home) replaces this with the real operational dashboard
 * (KPIs, activity feed, quick links).
 */
export default async function AdminHomePage() {
  const t = await getTranslations("admin.placeholders.home");
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("body")}</p>
    </div>
  );
}
