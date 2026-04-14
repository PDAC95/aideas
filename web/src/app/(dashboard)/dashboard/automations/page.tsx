import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchAutomationsPage } from "@/lib/dashboard/queries";
import { AutomationsFilterTabs } from "@/components/dashboard/automations-filter-tabs";
import { AutomationCard } from "@/components/dashboard/automation-card";

type ValidFilterStatus = "active" | "in_setup" | "paused";
const VALID_STATUSES: ValidFilterStatus[] = ["active", "in_setup", "paused"];

function isValidStatus(s: string): s is ValidFilterStatus {
  return (VALID_STATUSES as string[]).includes(s);
}

interface AutomationsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AutomationsPage({
  searchParams,
}: AutomationsPageProps) {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get org
  const orgId = await getOrgId(user.id);
  if (!orgId) {
    redirect("/dashboard");
  }

  // Read filter from search params (Next.js 16 — searchParams is a Promise)
  const { status: statusParam } = await searchParams;
  const activeFilter: ValidFilterStatus | null =
    statusParam && isValidStatus(statusParam) ? statusParam : null;

  // Fetch data and translations in parallel
  const [automations, t, locale] = await Promise.all([
    fetchAutomationsPage(orgId),
    getTranslations("dashboard.automations"),
    getLocale(),
  ]);

  // Compute tab counts
  const counts = {
    all: automations.length,
    active: automations.filter((a) => a.status === "active").length,
    in_setup: automations.filter((a) => a.status === "in_setup").length,
    paused: automations.filter((a) => a.status === "paused").length,
  };

  // Filter automations if a valid status filter is active
  const filteredAutomations = activeFilter
    ? automations.filter((a) => a.status === activeFilter)
    : automations;

  // Build status labels for StatusBadge
  const statusLabels: Record<string, string> = {
    active: t("status.active"),
    paused: t("status.paused"),
    in_setup: t("status.in_setup"),
    failed: t("status.failed"),
  };

  // Card translations (template strings with {count} / {price} placeholders)
  const cardTranslations = {
    monthlyMetric: t("card.monthlyMetric"),
    monthlyPrice: t("card.monthlyPrice"),
    configuring: t("card.configuring"),
    noData: t("card.noData"),
  };

  // Filter tab translations
  const filterTranslations = {
    all: t("filter.all"),
    active: t("filter.active"),
    in_setup: t("filter.in_setup"),
    paused: t("filter.paused"),
  };

  const totalCount = automations.length;

  return (
    <div>
      {/* Page header */}
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalCount === 1 ? t("count_one", { count: 1 }) : t("count", { count: totalCount })}
        </p>
      </div>

      {/* Filter tabs — wrapped in Suspense because useSearchParams requires it */}
      <Suspense fallback={<div className="h-10 mb-4" />}>
        <AutomationsFilterTabs counts={counts} translations={filterTranslations} />
      </Suspense>

      {/* Cards grid or empty state */}
      {filteredAutomations.length === 0 ? (
        activeFilter ? (
          // Filter-specific empty state
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t(`emptyFilter.${activeFilter}`)}
            </p>
          </div>
        ) : (
          // No automations at all
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-5xl select-none" aria-hidden="true">
              🤖
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("empty.title")}
            </h2>
            <Link
              href="/dashboard/catalog"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              {t("empty.cta")}
            </Link>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAutomations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              statusLabel={statusLabels[automation.status] ?? automation.status}
              translations={cardTranslations}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
