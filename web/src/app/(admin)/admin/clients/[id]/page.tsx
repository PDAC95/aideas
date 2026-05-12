import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { fetchAdminClientDetail } from "@/lib/admin/client-queries";
import { AdminClientDetail } from "@/components/admin/clients/admin-client-detail";
import {
  AdminClientTabs,
  type AdminClientTab,
} from "@/components/admin/clients/admin-client-tabs";
import { AdminClientAutomationsTab } from "@/components/admin/clients/admin-client-automations-tab";
import { AdminClientRequestsTab } from "@/components/admin/clients/admin-client-requests-tab";
import { AdminClientMembersTab } from "@/components/admin/clients/admin-client-members-tab";
import { AdminClientNotesTab } from "@/components/admin/clients/admin-client-notes-tab";

interface AdminClientDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const VALID_TABS: AdminClientTab[] = [
  "automations",
  "requests",
  "members",
  "notes",
];

function coerceTab(raw: string | undefined): AdminClientTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) {
    return raw as AdminClientTab;
  }
  return "automations";
}

/**
 * /admin/clients/[id] — 360 detail page (CLNT-03 + CLNT-04).
 *
 * Persistent header (org name + 5 stat cells) + 4 tabs:
 * Automations -> Requests -> Members -> Notes (read-only in 21-02; editor
 * lands in 21-03).
 *
 * Returns notFound() when the org id does not exist OR the org is
 * soft-deleted (deleted_at IS NOT NULL).
 */
export default async function AdminClientDetailPage({
  params,
  searchParams,
}: AdminClientDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = coerceTab(sp.tab);
  const locale = await getLocale();

  const [detail, t] = await Promise.all([
    fetchAdminClientDetail(id, locale),
    getTranslations("admin.clients.detail"),
  ]);

  if (!detail) notFound();

  const headerTranslations = {
    backLink: t("backLink"),
    header: {
      slugLabel: t("header.slugLabel"),
      createdLabel: t("header.createdLabel"),
      membersLabel: t("header.membersLabel"),
      activeAutomationsLabel: t("header.activeAutomationsLabel"),
      pendingRequestsLabel: t("header.pendingRequestsLabel"),
    },
  };

  const tabsTranslations = {
    automations: t.raw("tabs.automations") as string,
    requests: t.raw("tabs.requests") as string,
    members: t.raw("tabs.members") as string,
    notes: t.raw("tabs.notes") as string,
  };

  const automationsTabTranslations = {
    columns: {
      name: t("automations.columns.name"),
      status: t("automations.columns.status"),
      template: t("automations.columns.template"),
      createdAt: t("automations.columns.createdAt"),
      lastRun: t("automations.columns.lastRun"),
    },
    statusBadges: {
      draft: t("statusBadges.automation.draft"),
      pending_review: t("statusBadges.automation.pending_review"),
      in_setup: t("statusBadges.automation.in_setup"),
      active: t("statusBadges.automation.active"),
      paused: t("statusBadges.automation.paused"),
      failed: t("statusBadges.automation.failed"),
      archived: t("statusBadges.automation.archived"),
    } as Record<string, string>,
    noTemplate: t("automations.noTemplate"),
    neverRun: t("automations.neverRun"),
    empty: t("automations.empty"),
    viewAll: t("automations.viewAll"),
  };

  const requestsTabTranslations = {
    columns: {
      title: t("requests.columns.title"),
      status: t("requests.columns.status"),
      submittedBy: t("requests.columns.submittedBy"),
      createdAt: t("requests.columns.createdAt"),
    },
    statusBadges: {
      pending: t("statusBadges.request.pending"),
      in_review: t("statusBadges.request.in_review"),
      approved: t("statusBadges.request.approved"),
      completed: t("statusBadges.request.completed"),
      rejected: t("statusBadges.request.rejected"),
      payment_pending: t("statusBadges.request.payment_pending"),
      payment_failed: t("statusBadges.request.payment_failed"),
    } as Record<string, string>,
    empty: t("requests.empty"),
    viewAll: t("requests.viewAll"),
  };

  // CRITICAL: roles MUST include "owner" — handle_new_user trigger
  // (supabase/migrations/20260401000001_user_registration.sql) creates the
  // first organization_members row with role='owner'. Skipping "owner" would
  // render the most common role untranslated as a lowercase "owner".
  const membersTabTranslations = {
    columns: {
      email: t("members.columns.email"),
      fullName: t("members.columns.fullName"),
      role: t("members.columns.role"),
      lastLogin: t("members.columns.lastLogin"),
      joined: t("members.columns.joined"),
    },
    roles: {
      owner: t("members.roles.owner"),
      admin: t("members.roles.admin"),
      operator: t("members.roles.operator"),
      viewer: t("members.roles.viewer"),
    } as Record<string, string>,
    noFullName: t("members.noFullName"),
    neverLoggedIn: t("members.neverLoggedIn"),
    inactive: t("members.inactive"),
    empty: t("members.empty"),
  };

  // Notes editor (CLNT-05). The `entry` dict re-uses notes.writtenBy /
  // notes.edited (parent namespace) so view-mode metadata stays consistent
  // with the rest of the surface; the editor.entry namespace owns the
  // edit/delete-mode strings.
  const notesTabTranslations = {
    empty: t("notes.empty"),
    create: {
      addLabel: t("notes.editor.create.addLabel"),
      placeholder: t("notes.editor.create.placeholder"),
      save: t("notes.editor.create.save"),
      saving: t("notes.editor.create.saving"),
      cancel: t("notes.editor.create.cancel"),
      errorTooShort: t("notes.editor.create.errorTooShort"),
      errorTooLong: t("notes.editor.create.errorTooLong"),
      errorGeneric: t("notes.editor.create.errorGeneric"),
      charCounter: t.raw("notes.editor.create.charCounter") as string,
    },
    entry: {
      edit: t("notes.editor.entry.edit"),
      delete: t("notes.editor.entry.delete"),
      save: t("notes.editor.entry.save"),
      saving: t("notes.editor.entry.saving"),
      cancel: t("notes.editor.entry.cancel"),
      confirmDelete: t("notes.editor.entry.confirmDelete"),
      confirmDeleteBody: t("notes.editor.entry.confirmDeleteBody"),
      deleting: t("notes.editor.entry.deleting"),
      edited: t("notes.edited"),
      writtenBy: t.raw("notes.writtenBy") as string,
      errorTooShort: t("notes.editor.entry.errorTooShort"),
      errorTooLong: t("notes.editor.entry.errorTooLong"),
      errorGeneric: t("notes.editor.entry.errorGeneric"),
      charCounter: t.raw("notes.editor.entry.charCounter") as string,
    },
  };

  const counts = {
    automations: detail.automations.length,
    requests: detail.requests.length,
    members: detail.members.length,
    notes: detail.notes.length,
  };

  let body: React.ReactNode;
  if (tab === "automations") {
    body = (
      <AdminClientAutomationsTab
        rows={detail.automations}
        orgSlug={detail.slug}
        locale={locale}
        translations={automationsTabTranslations}
      />
    );
  } else if (tab === "requests") {
    body = (
      <AdminClientRequestsTab
        rows={detail.requests}
        orgSlug={detail.slug}
        locale={locale}
        translations={requestsTabTranslations}
      />
    );
  } else if (tab === "members") {
    body = (
      <AdminClientMembersTab
        rows={detail.members}
        locale={locale}
        translations={membersTabTranslations}
      />
    );
  } else {
    body = (
      <AdminClientNotesTab
        organizationId={detail.id}
        notes={detail.notes}
        locale={locale}
        translations={notesTabTranslations}
      />
    );
  }

  return (
    <AdminClientDetail
      detail={detail}
      locale={locale}
      translations={headerTranslations}
    >
      <AdminClientTabs
        active={tab}
        counts={counts}
        translations={tabsTranslations}
      />
      {body}
    </AdminClientDetail>
  );
}
