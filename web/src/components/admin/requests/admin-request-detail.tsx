import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AdminRequestDetail as AdminRequestDetailType } from "@/lib/admin/types";

interface AdminRequestDetailProps {
  detail: AdminRequestDetailType;
  locale: string;
  translations: {
    backLink: string;
    sectionCustomer: string;
    sectionRequest: string;
    sectionTimeline: string;
    sectionResult: string;
    customer: {
      org: string;
      slug: string;
      plan: string;
      noPlan: string;
      signupDate: string;
      activeAutomations: string;
      requester: string;
      viewClient: string;
    };
    request: {
      title: string;
      template: string;
      noTemplate: string;
      customRequirements: string;
      noRequirements: string;
      urgency: string;
      urgencyValues: { low: string; normal: string; urgent: string };
    };
    timeline: {
      createdBy: string;
      approvedBy: string;
      rejectedBy: string;
      staffPlaceholder: string;
    };
    result: {
      approvedTitle: string;
      approvedBody: string;
      automationLink: string;
      rejectedTitle: string;
      rejectedReason: string;
      rejectedNoReason: string;
    };
    statusBadges: { pending: string; approved: string; rejected: string };
  };
  actions?: ReactNode; // approve + reject buttons, only when status='pending'
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

function formatDateTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return iso.slice(0, 10);
  }
}

export function AdminRequestDetail({
  detail,
  locale,
  translations,
  actions,
}: AdminRequestDetailProps) {
  const status = detail.status as "pending" | "approved" | "rejected";
  const badgeCls = STATUS_BADGE_CLASS[status] ?? STATUS_BADGE_CLASS.pending;
  const badgeLabel =
    translations.statusBadges[status as keyof typeof translations.statusBadges] ??
    detail.status;

  const urgencyLabel =
    translations.request.urgencyValues[
      detail.urgency as "low" | "normal" | "urgent"
    ] ?? detail.urgency;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/requests"
          className="inline-flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
        >
          ← {translations.backLink}
        </Link>
      </div>

      {/* Header: title + status badge */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {detail.title}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDateTime(detail.createdAt, locale)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer card */}
        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {translations.sectionCustomer}
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.org}
              </dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {detail.organizationName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.slug}
              </dt>
              <dd className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                {detail.organizationSlug}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.plan}
              </dt>
              <dd className="text-gray-700 dark:text-gray-300 capitalize">
                {detail.organizationPlan ?? translations.customer.noPlan}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.signupDate}
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">
                {formatDate(detail.organizationCreatedAt, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.activeAutomations}
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">
                {detail.organizationActiveAutomationsCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 dark:text-gray-400">
                {translations.customer.requester}
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">
                {detail.requesterFullName ?? detail.requesterEmail}
                <br />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {detail.requesterEmail}
                </span>
              </dd>
            </div>
          </dl>
          <Link
            href={`/admin/clients/${detail.organizationId}`}
            className="inline-block text-xs text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
          >
            {translations.customer.viewClient} →
          </Link>
        </section>

        {/* Request body + actions + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {translations.sectionRequest}
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.request.template}
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {detail.templateId
                    ? detail.templateDisplayName
                    : translations.request.noTemplate}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.request.urgency}
                </dt>
                <dd className="text-gray-700 dark:text-gray-300 capitalize">
                  {urgencyLabel}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.request.customRequirements}
                </dt>
                <dd className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {detail.customRequirements?.trim() ||
                    translations.request.noRequirements}
                </dd>
              </div>
            </dl>

            {status === "pending" && actions && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {actions}
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {translations.sectionTimeline}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {translations.timeline.createdBy.replace(
                      "{user}",
                      detail.requesterFullName ?? detail.requesterEmail
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(detail.createdAt, locale)}
                  </div>
                </div>
              </li>
              {status === "approved" && (
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {translations.timeline.approvedBy.replace(
                        "{user}",
                        translations.timeline.staffPlaceholder
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(
                        detail.completedAt ?? detail.updatedAt,
                        locale
                      )}
                    </div>
                  </div>
                </li>
              )}
              {status === "rejected" && (
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {translations.timeline.rejectedBy.replace(
                        "{user}",
                        translations.timeline.staffPlaceholder
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(
                        detail.completedAt ?? detail.updatedAt,
                        locale
                      )}
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </section>

          {/* Result panel for terminal states */}
          {status === "approved" && (
            <section className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
                {translations.sectionResult}
              </h2>
              <p className="text-sm text-green-700 dark:text-green-200">
                {translations.result.approvedTitle}
              </p>
              <p className="text-sm text-green-700 dark:text-green-200">
                {translations.result.approvedBody}
              </p>
              {detail.resultingAutomationId && (
                <Link
                  href={`/admin/automations/${detail.resultingAutomationId}`}
                  className="inline-block text-sm text-green-800 underline hover:text-green-900 dark:text-green-200"
                >
                  {translations.result.automationLink} →
                </Link>
              )}
            </section>
          )}

          {status === "rejected" && (
            <section className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                {translations.sectionResult}
              </h2>
              <p className="text-sm font-medium text-red-700 dark:text-red-200">
                {translations.result.rejectedTitle}
              </p>
              <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-wrap">
                {translations.result.rejectedReason.replace(
                  "{reason}",
                  detail.notes?.trim() || translations.result.rejectedNoReason
                )}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
