import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import type {
  AdminRequestRow,
  AdminRequestDetail,
  AdminRequestStatus,
  AdminRequestTab,
  AdminRequestStatusCounts,
} from "./types";
import { TAB_TO_STATUSES } from "./types";

const ACTIVE_LIKE_STATUSES = [
  "active",
  "in_setup",
  "paused",
  "pending_review",
] as const;

const PREVIEW_MAX = 80;

function preview(text: string | null | undefined): string {
  const t = (text ?? "").trim();
  if (t.length <= PREVIEW_MAX) return t;
  return t.slice(0, PREVIEW_MAX - 1).trimEnd() + "…";
}

/**
 * List automation_requests for the admin inbox, scoped to a single UI TAB
 * (which fans out to one or more real DB statuses via TAB_TO_STATUSES).
 *
 * Ordering rule (per CONTEXT.md):
 *   - tab="pending"  -> created_at ASC  (FIFO, oldest waiting first)
 *   - any other tab  -> created_at DESC (most recent first)
 *
 * Joins:
 *   - organizations (for org name)
 *   - automation_template_translations LEFT JOIN filtered by locale + field='name'
 *     (to render the human template name in the row)
 *   - When template_id is NULL the templateDisplayName falls back to the
 *     request title.
 */
export async function fetchAdminRequests(input: {
  tab: AdminRequestTab;
  locale: string;
}): Promise<AdminRequestRow[]> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminRequests: not authorized (${auth.error})`);
  }

  const ascending = input.tab === "pending";
  const statuses = TAB_TO_STATUSES[input.tab];

  const { data, error } = await supabase
    .from("automation_requests")
    .select(
      `
      id, organization_id, template_id, title, description, status, created_at,
      organizations!inner(name),
      template:automation_templates!left(
        id, slug,
        translations:automation_template_translations!left(field, value, locale)
      )
      `
    )
    .in("status", statuses as unknown as string[])
    .is("deleted_at", null)
    .eq("template.translations.locale", input.locale)
    .eq("template.translations.field", "name")
    .order("created_at", { ascending });

  if (error) throw error;

  type RawRow = {
    id: string;
    organization_id: string;
    template_id: string | null;
    title: string;
    description: string;
    status: string;
    created_at: string;
    organizations: { name: string };
    template: {
      id: string;
      slug: string;
      translations: Array<{ field: string; value: string; locale: string }> | null;
    } | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];

  return rows.map((row) => {
    const tmplName = row.template?.translations?.[0]?.value;
    const fallback = row.template?.slug ?? row.title;
    return {
      id: row.id,
      organizationId: row.organization_id,
      organizationName: row.organizations.name,
      templateId: row.template_id,
      templateDisplayName: tmplName ?? fallback,
      status: row.status as AdminRequestStatus,
      customRequirementsPreview: preview(row.description),
      createdAt: row.created_at,
    };
  });
}

/**
 * Tab counters. Three count-only queries (one per TAB) using the TAB→statuses
 * mapping. Each query uses `count: 'exact', head: true` so we never transfer
 * row data — just the count. The UI shows "(N)" on each tab from this result.
 */
export async function fetchAdminRequestStatusCounts(): Promise<AdminRequestStatusCounts> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminRequestStatusCounts: not authorized (${auth.error})`);
  }

  const tabs: AdminRequestTab[] = ["pending", "approved", "rejected"];

  const results = await Promise.all(
    tabs.map(async (tab) => {
      const statuses = TAB_TO_STATUSES[tab];
      const { count, error } = await supabase
        .from("automation_requests")
        .select("id", { count: "exact", head: true })
        .in("status", statuses as unknown as string[])
        .is("deleted_at", null);
      if (error) throw error;
      return [tab, count ?? 0] as const;
    })
  );

  const counts: AdminRequestStatusCounts = { pending: 0, approved: 0, rejected: 0 };
  for (const [tab, n] of results) {
    counts[tab] = n;
  }
  return counts;
}

/**
 * Detail view: single request + requester profile + org metadata + linked
 * template + active-automations count for the requesting org.
 *
 * Two round trips:
 *   1. Main SELECT joining automation_requests with organizations, profiles,
 *      automation_templates(+translation), subscriptions(latest active row).
 *   2. Aggregate SELECT against automations to count active-like rows for the
 *      requesting org (mirrors the Phase 18 catalog-queries pattern).
 *
 * If status='approved' AND there is exactly one automation row pointing at this
 * request's (organization_id, template_id) created at or after the request's
 * created_at, surface its id as resultingAutomationId. Otherwise null. The
 * detail page renders the link only when this id is present.
 */
export async function fetchAdminRequestDetail(
  requestId: string,
  locale: string
): Promise<AdminRequestDetail | null> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminRequestDetail: not authorized (${auth.error})`);
  }

  const { data, error } = await supabase
    .from("automation_requests")
    .select(
      `
      id, organization_id, template_id, user_id,
      title, description, urgency, status, notes,
      created_at, updated_at, completed_at,
      organization:organizations!inner(id, name, slug, created_at),
      requester:profiles!inner(id, email, full_name),
      template:automation_templates!left(
        id, slug,
        translations:automation_template_translations!left(field, value, locale)
      ),
      subscription:subscriptions!left(plan, status)
      `
    )
    .eq("id", requestId)
    .is("deleted_at", null)
    .eq("template.translations.locale", locale)
    .eq("template.translations.field", "name")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type RawDetail = {
    id: string;
    organization_id: string;
    template_id: string | null;
    user_id: string;
    title: string;
    description: string;
    urgency: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    organization: { id: string; name: string; slug: string; created_at: string };
    requester: { id: string; email: string; full_name: string | null };
    template: {
      id: string;
      slug: string;
      translations: Array<{ field: string; value: string; locale: string }> | null;
    } | null;
    subscription: Array<{ plan: string; status: string }> | { plan: string; status: string } | null;
  };
  const detail = data as unknown as RawDetail;

  // Active automations for this org.
  const { data: autoCountData, error: autoCountError } = await supabase
    .from("automations")
    .select("id", { count: "exact", head: false })
    .eq("organization_id", detail.organization_id)
    .in("status", ACTIVE_LIKE_STATUSES as unknown as string[])
    .is("deleted_at", null);
  if (autoCountError) throw autoCountError;
  const activeAutomationsCount = (autoCountData ?? []).length;

  // Resulting automation id (only when approved and we can match deterministically).
  let resultingAutomationId: string | null = null;
  if (detail.status === "approved" && detail.template_id) {
    const { data: matchedAutomation } = await supabase
      .from("automations")
      .select("id, created_at")
      .eq("organization_id", detail.organization_id)
      .eq("template_id", detail.template_id)
      .gte("created_at", detail.created_at)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    resultingAutomationId = matchedAutomation?.id ?? null;
  }

  const tmplName = detail.template?.translations?.[0]?.value;
  const tmplFallback = detail.template?.slug ?? detail.title;

  // Subscription may come back as a single object OR a one-element array
  // depending on how Supabase resolves the !left embed. Normalize either way.
  const sub = Array.isArray(detail.subscription)
    ? detail.subscription[0] ?? null
    : detail.subscription ?? null;

  return {
    id: detail.id,
    organizationId: detail.organization.id,
    organizationName: detail.organization.name,
    organizationSlug: detail.organization.slug,
    organizationCreatedAt: detail.organization.created_at,
    organizationPlan: sub?.plan ?? null,
    organizationActiveAutomationsCount: activeAutomationsCount,
    requesterUserId: detail.requester.id,
    requesterFullName: detail.requester.full_name,
    requesterEmail: detail.requester.email,
    templateId: detail.template_id,
    templateSlug: detail.template?.slug ?? null,
    templateDisplayName: tmplName ?? tmplFallback,
    title: detail.title,
    customRequirements: detail.description,
    urgency: detail.urgency,
    status: detail.status as AdminRequestStatus,
    notes: detail.notes,
    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
    completedAt: detail.completed_at,
    resultingAutomationId,
  };
}
