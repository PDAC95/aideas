import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import type {
  AdminClientRow,
  AdminClientListFilters,
  AdminClientsListResult,
  AdminClientDetail,
  AdminClientAutomationRow,
  AdminClientRequestRow,
  AdminClientMember,
  AdminClientNoteEntry,
} from "./types";

/**
 * "Active-like" automation statuses for the # active automations column.
 * Mirrors Phase 19 request-queries.ts ACTIVE_LIKE_STATUSES so the same
 * definition of "active" is used across the admin surface.
 */
const ACTIVE_LIKE_STATUSES = [
  "active",
  "in_setup",
  "paused",
  "pending_review",
] as const;

const MAX_PAGE_SIZE = 100;

/**
 * Tab limit for the detail page tab datasets. CONTEXT.md prescribes 25 rows
 * per tab plus a "View all" link to the corresponding global admin list
 * filtered by ?org=<slug>.
 */
const TAB_LIMIT = 25;

/**
 * "Active-like" set for the Requests tab pendingRequestsCount header counter.
 * Mirrors Phase 19 request-queries.ts groupings: pending + in_review +
 * payment_pending + payment_failed are all "still waiting on staff or
 * customer action" from a header-counter perspective.
 */
const ACTIVE_LIKE_REQUEST_STATUSES = [
  "pending",
  "in_review",
  "payment_pending",
  "payment_failed",
] as const;

/**
 * List organizations for the admin clients view.
 *
 * Strategy (two round trips):
 *   1. Pull paginated organizations matching `q` (ILIKE on name OR slug).
 *      Use .range() for offset/limit and { count: "exact" } so we get
 *      totalCount for the pager in the same response.
 *   2. For the page's org IDs, pull (a) automations with active-like statuses
 *      (.in("status", ACTIVE_LIKE_STATUSES) + .is("deleted_at", null)) and
 *      (b) organization_members with is_active=true. Bucket both in JS keyed
 *      by organization_id.
 *
 * Returns rows + totalCount + page metadata. Default sort is created_at DESC
 * (CONTEXT.md). Soft-deleted orgs (deleted_at IS NOT NULL) are excluded.
 *
 * Throws on auth failure — admin layout already gates the route.
 */
export async function fetchAdminClients(
  filters: AdminClientListFilters
): Promise<AdminClientsListResult> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminClients: not authorized (${auth.error})`);
  }

  // Coerce page + pageSize defensively.
  const page = Math.max(1, Math.floor(filters.page) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(filters.pageSize) || 25)
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let orgQuery = supabase
    .from("organizations")
    .select("id, name, slug, created_at", { count: "exact" })
    .is("deleted_at", null);

  // ILIKE on (name OR slug). Escape % and _ to prevent wildcard injection
  // (same defense Phase 20 automation-queries.ts uses).
  if (filters.q && filters.q.trim().length > 0) {
    const escaped = filters.q.trim().replace(/[%_]/g, (c) => `\\${c}`);
    const pattern = `%${escaped}%`;
    orgQuery = orgQuery.or(`name.ilike.${pattern},slug.ilike.${pattern}`);
  }

  const { data, error, count } = await orgQuery
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  type RawOrg = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
  };
  const orgs = (data ?? []) as RawOrg[];
  const orgIds = orgs.map((o) => o.id);

  // Per-org counts. Two round trips, each bucketed in JS. Skip both when
  // orgIds is empty (avoids needless network calls).
  const automationsCount = new Map<string, number>();
  const membersCount = new Map<string, number>();

  if (orgIds.length > 0) {
    const [
      { data: autos, error: autosError },
      { data: mems, error: memsError },
    ] = await Promise.all([
      supabase
        .from("automations")
        .select("organization_id")
        .in("organization_id", orgIds)
        .in("status", ACTIVE_LIKE_STATUSES as unknown as string[])
        .is("deleted_at", null),
      supabase
        .from("organization_members")
        .select("organization_id")
        .in("organization_id", orgIds)
        .eq("is_active", true),
    ]);
    if (autosError) throw autosError;
    if (memsError) throw memsError;

    for (const r of (autos ?? []) as Array<{ organization_id: string }>) {
      automationsCount.set(
        r.organization_id,
        (automationsCount.get(r.organization_id) ?? 0) + 1
      );
    }
    for (const r of (mems ?? []) as Array<{ organization_id: string }>) {
      membersCount.set(
        r.organization_id,
        (membersCount.get(r.organization_id) ?? 0) + 1
      );
    }
  }

  const rows: AdminClientRow[] = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    activeAutomationsCount: automationsCount.get(o.id) ?? 0,
    membersCount: membersCount.get(o.id) ?? 0,
    createdAt: o.created_at,
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return { rows, totalCount, page, pageSize, totalPages };
}

/**
 * Fetch the full 360 detail for /admin/clients/[id].
 *
 * Strategy: 8 parallel round trips, all gated by assertPlatformStaff. Each
 * round trip fills one section of the AdminClientDetail:
 *   1. orgs row + name/slug/created_at metadata.
 *   2. Automations tab listing (top 25 by created_at DESC, joined to template
 *      translations for the requested locale).
 *   3. Header counter: COUNT of active-like automations.
 *   4. Requests tab listing (top 25 by created_at DESC, joined to requester
 *      profile).
 *   5. Header counter: COUNT of pending-like requests.
 *   6. Members tab via SECURITY-DEFINER RPC (joins organization_members +
 *      profiles + auth.users so we can surface last_sign_in_at).
 *   7. Header counter: COUNT of active organization_members.
 *   8. Notes tab listing (top 25 by created_at DESC, joined to author profile).
 *
 * Returns null if:
 *   - the org id does not exist, OR
 *   - the org is soft-deleted (deleted_at IS NOT NULL).
 *
 * Throws on auth failure (admin layout already gates the route) and on any
 * non-org Supabase error.
 */
export async function fetchAdminClientDetail(
  organizationId: string,
  locale: string
): Promise<AdminClientDetail | null> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminClientDetail: not authorized (${auth.error})`);
  }

  // 1. Org row + metadata.
  const orgPromise = supabase
    .from("organizations")
    .select("id, name, slug, created_at")
    .eq("id", organizationId)
    .is("deleted_at", null)
    .maybeSingle();

  // 2. Automations tab listing — all statuses (the listing is broader than the
  //    header counter); locale-aware embed-join to template translations.
  const automationsListPromise = supabase
    .from("automations")
    .select(
      `
      id, name, status, created_at, last_run_at,
      template:automation_templates!left(
        id, slug,
        translations:automation_template_translations!left(field, value, locale)
      )
      `
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .eq("template.translations.locale", locale)
    .eq("template.translations.field", "name")
    .order("created_at", { ascending: false })
    .limit(TAB_LIMIT);

  // 3. Header counter: active-like automations.
  const automationsActiveCountPromise = supabase
    .from("automations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .in("status", ACTIVE_LIKE_STATUSES as unknown as string[]);

  // 4. Requests tab listing — all statuses (broader than header counter).
  const requestsListPromise = supabase
    .from("automation_requests")
    .select(
      `
      id, title, status, created_at,
      requester:profiles!inner(id, email, full_name)
      `
    )
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(TAB_LIMIT);

  // 5. Header counter: pending-like requests.
  const requestsPendingCountPromise = supabase
    .from("automation_requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .in("status", ACTIVE_LIKE_REQUEST_STATUSES as unknown as string[]);

  // 6. Members tab via SECURITY-DEFINER RPC. RPC returns email + full_name +
  //    role + is_active + joined_at + user_id + last_sign_in_at, already sorted
  //    by (is_active DESC, joined_at DESC) inside the function body.
  const membersPromise = supabase.rpc("get_admin_org_members", {
    p_organization_id: organizationId,
  });

  // 7. Header counter: active organization_members. Cheap HEAD count.
  const membersCountPromise = supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  // 8. Notes tab listing. Top 25 by created_at DESC, joined to author profile.
  const notesPromise = supabase
    .from("organization_notes")
    .select(
      `
      id, body, created_at, updated_at, author_id,
      author:profiles!inner(id, email, full_name)
      `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(TAB_LIMIT);

  const [
    orgRes,
    autosListRes,
    autosCountRes,
    reqsListRes,
    reqsCountRes,
    membersRes,
    membersCountRes,
    notesRes,
  ] = await Promise.all([
    orgPromise,
    automationsListPromise,
    automationsActiveCountPromise,
    requestsListPromise,
    requestsPendingCountPromise,
    membersPromise,
    membersCountPromise,
    notesPromise,
  ]);

  if (orgRes.error) throw orgRes.error;
  if (!orgRes.data) return null;
  if (autosListRes.error) throw autosListRes.error;
  if (autosCountRes.error) throw autosCountRes.error;
  if (reqsListRes.error) throw reqsListRes.error;
  if (reqsCountRes.error) throw reqsCountRes.error;
  if (membersRes.error) throw membersRes.error;
  if (membersCountRes.error) throw membersCountRes.error;
  if (notesRes.error) throw notesRes.error;

  // Map Automations rows. Defensive embed-shape normalization (Supabase JS
  // sometimes returns single-row !left embeds as T, sometimes T[] — pattern
  // documented in Phase 19 + Phase 20 SUMMARYs).
  type RawAutoTemplate = {
    id: string;
    slug: string;
    translations:
      | Array<{ field: string; value: string; locale: string }>
      | null;
  };
  type RawAuto = {
    id: string;
    name: string;
    status: string;
    created_at: string;
    last_run_at: string | null;
    template: RawAutoTemplate | RawAutoTemplate[] | null;
  };
  const rawAutos = (autosListRes.data ?? []) as unknown as RawAuto[];
  const automations: AdminClientAutomationRow[] = rawAutos.map((a) => {
    const tmpl = Array.isArray(a.template)
      ? a.template[0] ?? null
      : a.template ?? null;
    const tmplName =
      tmpl && Array.isArray(tmpl.translations)
        ? tmpl.translations[0]?.value ?? null
        : null;
    return {
      id: a.id,
      name: a.name,
      status: a.status,
      templateDisplayName: tmplName ?? tmpl?.slug ?? null,
      createdAt: a.created_at,
      lastRunAt: a.last_run_at,
    };
  });

  // Map Requests rows. Same defensive embed-shape normalization on requester.
  type RawRequester = {
    id: string;
    email: string;
    full_name: string | null;
  };
  type RawReq = {
    id: string;
    title: string;
    status: string;
    created_at: string;
    requester: RawRequester | RawRequester[] | null;
  };
  const rawReqs = (reqsListRes.data ?? []) as unknown as RawReq[];
  const requests: AdminClientRequestRow[] = rawReqs.map((r) => {
    const rq = Array.isArray(r.requester)
      ? r.requester[0] ?? null
      : r.requester ?? null;
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      submittedByEmail: rq?.email ?? "",
      submittedByFullName: rq?.full_name ?? null,
      createdAt: r.created_at,
    };
  });

  // Map Members from the RPC. RPC return is a flat array of plain rows.
  type RawMember = {
    user_id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    joined_at: string;
    last_sign_in_at: string | null;
  };
  const rawMembers = (membersRes.data ?? []) as RawMember[];
  const members: AdminClientMember[] = rawMembers
    .slice(0, TAB_LIMIT)
    .map((m) => ({
      userId: m.user_id,
      email: m.email,
      fullName: m.full_name,
      role: m.role,
      isActive: m.is_active,
      joinedAt: m.joined_at,
      lastSignInAt: m.last_sign_in_at,
    }));

  // Map Notes rows. Same defensive embed-shape normalization on author.
  type RawAuthor = {
    id: string;
    email: string;
    full_name: string | null;
  };
  type RawNote = {
    id: string;
    body: string;
    created_at: string;
    updated_at: string;
    author_id: string;
    author: RawAuthor | RawAuthor[] | null;
  };
  const rawNotes = (notesRes.data ?? []) as unknown as RawNote[];
  const notes: AdminClientNoteEntry[] = rawNotes.map((n) => {
    const author = Array.isArray(n.author)
      ? n.author[0] ?? null
      : n.author ?? null;
    return {
      id: n.id,
      body: n.body,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      authorId: n.author_id,
      authorEmail: author?.email ?? "",
      authorFullName: author?.full_name ?? null,
    };
  });

  return {
    id: orgRes.data.id,
    name: orgRes.data.name,
    slug: orgRes.data.slug,
    createdAt: orgRes.data.created_at,

    membersCount: membersCountRes.count ?? 0,
    activeAutomationsCount: autosCountRes.count ?? 0,
    pendingRequestsCount: reqsCountRes.count ?? 0,

    automations,
    requests,
    members,
    notes,
  };
}
