import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { fetchAdminRequestDetail } from "@/lib/admin/request-queries";
import { AdminRequestDetail } from "@/components/admin/requests/admin-request-detail";
import { ApproveRequestButton } from "@/components/admin/requests/approve-request-button";
import { RejectRequestModal } from "@/components/admin/requests/reject-request-modal";

interface AdminRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Admin Requests Inbox - detail view (REQS-02).
 *
 * Server-rendered layout that consumes fetchAdminRequestDetail. The two
 * action UI pieces (approve button + reject modal) are the only client
 * components; they're passed as a single `actions` ReactNode slot which the
 * detail layout renders inside the request card when status='pending'.
 *
 * Translations are pre-resolved here so the client subtree never imports
 * useTranslations() — same pattern as the catalog admin (Phase 18).
 */
export default async function AdminRequestDetailPage({
  params,
}: AdminRequestDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();

  const [detail, t, tList] = await Promise.all([
    fetchAdminRequestDetail(id, locale),
    getTranslations("admin.requests.detail"),
    getTranslations("admin.requests.list"),
  ]);

  if (!detail) notFound();

  // Pre-resolve every label both detail layout + action components need.
  const detailTranslations = {
    backLink: t("backLink"),
    sectionCustomer: t("sections.customer"),
    sectionRequest: t("sections.request"),
    sectionTimeline: t("sections.timeline"),
    sectionResult: t("sections.result"),
    customer: {
      org: t("customer.org"),
      slug: t("customer.slug"),
      plan: t("customer.plan"),
      noPlan: t("customer.noPlan"),
      signupDate: t("customer.signupDate"),
      activeAutomations: t("customer.activeAutomations"),
      requester: t("customer.requester"),
      viewClient: t("customer.viewClient"),
    },
    request: {
      title: t("request.title"),
      template: t("request.template"),
      noTemplate: tList("noTemplate"),
      customRequirements: t("request.customRequirements"),
      noRequirements: tList("noRequirements"),
      urgency: t("request.urgency"),
      urgencyValues: {
        low: t("request.urgencyValues.low"),
        normal: t("request.urgencyValues.normal"),
        urgent: t("request.urgencyValues.urgent"),
      },
    },
    timeline: {
      createdBy: t.raw("timeline.createdBy") as string,
      approvedBy: t.raw("timeline.approvedBy") as string,
      rejectedBy: t.raw("timeline.rejectedBy") as string,
      staffPlaceholder: t("timeline.staffPlaceholder"),
    },
    result: {
      approvedTitle: t("result.approvedTitle"),
      approvedBody: t("result.approvedBody"),
      automationLink: t("result.automationLink"),
      rejectedTitle: t("result.rejectedTitle"),
      rejectedReason: t.raw("result.rejectedReason") as string,
      rejectedNoReason: t("result.rejectedNoReason"),
    },
    statusBadges: {
      pending: tList("statusBadges.pending"),
      approved: tList("statusBadges.approved"),
      rejected: tList("statusBadges.rejected"),
    },
  };

  const approveTranslations = {
    approve: t("actions.approve"),
    approving: t("actions.approving"),
    errorStateChanged: t("actions.errorStateChanged"),
    errorGeneric: t("actions.errorGeneric"),
  };

  const rejectTranslations = {
    triggerLabel: t("actions.reject"),
    title: t("rejectModal.title"),
    body: t("rejectModal.body"),
    placeholder: t("rejectModal.placeholder"),
    cancel: t("rejectModal.cancel"),
    confirm: t("rejectModal.confirm"),
    confirming: t("rejectModal.confirming"),
    errorTooShort: t("rejectModal.errorTooShort"),
    errorTooLong: t("rejectModal.errorTooLong"),
    errorStateChanged: t("rejectModal.errorStateChanged"),
    errorGeneric: t("rejectModal.errorGeneric"),
    charCounter: t.raw("rejectModal.charCounter") as string,
  };

  const actions =
    detail.status === "pending" ? (
      <>
        <ApproveRequestButton
          requestId={detail.id}
          translations={approveTranslations}
        />
        <RejectRequestModal
          requestId={detail.id}
          translations={rejectTranslations}
        />
      </>
    ) : null;

  return (
    <AdminRequestDetail
      detail={detail}
      locale={locale}
      translations={detailTranslations}
      actions={actions}
    />
  );
}
