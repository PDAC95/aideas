import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AdminAutomationDetail as AdminAutomationDetailType } from "@/lib/admin/types";
import { AdminAutomationKpis } from "./admin-automation-kpis";
import { AdminAutomationTimeline } from "./admin-automation-timeline";

interface AdminAutomationDetailProps {
  detail: AdminAutomationDetailType;
  locale: string;
  translations: {
    backLink: string;
    statusBadges: {
      active: string;
      in_setup: string;
      paused: string;
      failed: string;
      archived: string;
      draft: string;
      pending_review: string;
    };
    kpis: {
      totalExecutions: string;
      hoursSaved: string;
      successRate: string;
      lastExecution: string;
      never: string;
      notAvailable: string;
    };
    timeline: {
      title: string;
      empty: string;
      duration: string;
      statusLabels: {
        running: string;
        success: string;
        error: string;
        cancelled: string;
      };
    };
    org: {
      sectionTitle: string;
      slugLabel: string;
      viewClient: string;
    };
    template: {
      sectionTitle: string;
      categoryLabel: string;
      monthlyPriceLabel: string;
      noPrice: string;
      noTemplate: string;
      noTemplateBody: string;
    };
    setupNotes: {
      sectionTitle: string;
    };
  };
  actions?: ReactNode; // 20-03 fills with transition buttons; null in 20-02
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  in_setup: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  archived: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  pending_review:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
};

function formatPriceCents(cents: number | null, locale: string): string | null {
  if (cents === null) return null;
  const dollars = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function AdminAutomationDetail({
  detail,
  locale,
  translations,
  actions,
}: AdminAutomationDetailProps) {
  const statusKey = detail.status as keyof typeof translations.statusBadges;
  const badgeLabel = translations.statusBadges[statusKey] ?? detail.status;
  const badgeCls =
    STATUS_BADGE_CLASS[detail.status] ?? STATUS_BADGE_CLASS.draft;
  const monthlyPriceText = formatPriceCents(
    detail.templateMonthlyPriceCents,
    locale
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/automations"
          className="inline-flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
        >
          {"← "}
          {translations.backLink}
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {detail.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                badgeCls
              )}
            >
              {badgeLabel}
            </span>
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {/* KPI grid */}
      <AdminAutomationKpis
        totalExecutions={detail.totalExecutions}
        hoursSaved={detail.hoursSaved}
        successRate={detail.successRate}
        lastRunAt={detail.lastRunAt}
        locale={locale}
        translations={translations.kpis}
      />

      {/* 2-column body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: timeline */}
        <div className="lg:col-span-2">
          <AdminAutomationTimeline
            executions={detail.recentExecutions}
            locale={locale}
            translations={translations.timeline}
          />
        </div>

        {/* Right: org + template + setup_notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Org card */}
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {translations.org.sectionTitle}
            </h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.org.sectionTitle}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {detail.organizationName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.org.slugLabel}
                </dt>
                <dd className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {detail.organizationSlug}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/clients/${detail.organizationId}`}
              className="mt-3 inline-block text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
            >
              {translations.org.viewClient}
              {" →"}
            </Link>
          </section>

          {/* Template card */}
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {translations.template.sectionTitle}
            </h2>
            {detail.templateId ? (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    {translations.template.sectionTitle}
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {detail.templateDisplayName}
                  </dd>
                </div>
                {detail.templateCategory && (
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">
                      {translations.template.categoryLabel}
                    </dt>
                    <dd className="text-gray-700 dark:text-gray-300 capitalize">
                      {detail.templateCategory}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500 dark:text-gray-400">
                    {translations.template.monthlyPriceLabel}
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300 tabular-nums">
                    {monthlyPriceText ?? translations.template.noPrice}
                  </dd>
                </div>
              </dl>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {translations.template.noTemplate}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {translations.template.noTemplateBody}
                </p>
              </div>
            )}
          </section>

          {/* Setup notes (only if non-empty after trim) */}
          {detail.setupNotes && detail.setupNotes.trim().length > 0 && (
            <section className="rounded-lg border border-purple-200 bg-purple-50 p-5 dark:border-purple-900/50 dark:bg-purple-950/20">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                {translations.setupNotes.sectionTitle}
              </h2>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {detail.setupNotes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
