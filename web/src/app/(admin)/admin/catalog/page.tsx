import { getTranslations } from "next-intl/server";

/**
 * Catalog Admin placeholder. Phase 18 replaces this with template CRUD.
 */
export default async function AdminCatalogPage() {
  const t = await getTranslations("admin.placeholders.catalog");
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t("body")}</p>
    </div>
  );
}
