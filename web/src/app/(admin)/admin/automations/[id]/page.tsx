import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { fetchAdminAutomationDetail } from "@/lib/admin/automation-queries";
import { AdminAutomationDetail } from "@/components/admin/automations/admin-automation-detail";

interface AdminAutomationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAutomationDetailPage({
  params,
}: AdminAutomationDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const [detail, t] = await Promise.all([
    fetchAdminAutomationDetail(id, locale),
    getTranslations("admin.automations.detail"),
  ]);

  if (!detail) notFound();

  const translations = {
    backLink: t("backLink"),
    statusBadges: {
      active: t("statusBadges.active"),
      in_setup: t("statusBadges.in_setup"),
      paused: t("statusBadges.paused"),
      failed: t("statusBadges.failed"),
      archived: t("statusBadges.archived"),
      draft: t("statusBadges.draft"),
      pending_review: t("statusBadges.pending_review"),
    },
    kpis: {
      totalExecutions: t("kpis.totalExecutions"),
      hoursSaved: t("kpis.hoursSaved"),
      successRate: t("kpis.successRate"),
      lastExecution: t("kpis.lastExecution"),
      never: t("kpis.never"),
      notAvailable: t("kpis.notAvailable"),
    },
    timeline: {
      title: t("timeline.title"),
      empty: t("timeline.empty"),
      duration: t.raw("timeline.duration") as string,
      statusLabels: {
        running: t("timeline.statusLabels.running"),
        success: t("timeline.statusLabels.success"),
        error: t("timeline.statusLabels.error"),
        cancelled: t("timeline.statusLabels.cancelled"),
      },
    },
    org: {
      sectionTitle: t("org.sectionTitle"),
      slugLabel: t("org.slugLabel"),
      viewClient: t("org.viewClient"),
    },
    template: {
      sectionTitle: t("template.sectionTitle"),
      categoryLabel: t("template.categoryLabel"),
      monthlyPriceLabel: t("template.monthlyPriceLabel"),
      noPrice: t("template.noPrice"),
      noTemplate: t("template.noTemplate"),
      noTemplateBody: t("template.noTemplateBody"),
    },
    setupNotes: {
      sectionTitle: t("setupNotes.sectionTitle"),
    },
  };

  return (
    <AdminAutomationDetail
      detail={detail}
      locale={locale}
      translations={translations}
      actions={null}
    />
  );
}
