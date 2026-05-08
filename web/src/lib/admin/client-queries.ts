import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import type {
  AdminClientRow,
  AdminClientListFilters,
  AdminClientsListResult,
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
