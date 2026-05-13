import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Strict RFC 4122 v1-5 UUID detector. Returns false for empty / null inputs.
 *
 * Used by `resolveOrgIdentifier` to decide whether to lookup an org by id
 * (UUID path) or by slug (text path). The regex matches the
 * canonical 8-4-4-4-12 hex layout with version nibble in 1..5 and
 * variant nibble in 8..b (RFC 4122 v1-5; covers all UUIDs Supabase
 * `gen_random_uuid()` produces, which are v4).
 */
export function isUuid(value: string): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Result of resolving an org identifier (slug or UUID) to a concrete org.
 *
 * - `orgId`: the UUID to use in `.eq("organization_id", ...)` filters. `null`
 *   when no identifier was provided OR when the provided identifier could not
 *   be resolved to a live (non-deleted) organization.
 * - `resolvedOrg`: the matched org row for filter-chip rendering, or `null`.
 * - `orgIdentifierProvided`: the trimmed raw input (post-cap), or `null` when
 *   the caller passed nothing. Lets callers distinguish "no filter requested"
 *   from "filter requested but identifier did not resolve".
 */
export interface ResolveOrgIdentifierResult {
  orgId: string | null;
  resolvedOrg: { id: string; name: string; slug: string } | null;
  orgIdentifierProvided: string | null;
}

const IDENTIFIER_MAX_LENGTH = 100;

/**
 * Resolve an org identifier (UUID or slug) coming from a query string or
 * server-component prop into a concrete org row.
 *
 * Behavior:
 *   - Empty / whitespace-only input → returns all-nulls (no filter requested).
 *   - Strict UUID → SELECT by id (non-deleted only).
 *   - Otherwise → SELECT by slug (non-deleted only).
 *   - Defensively trims the input and caps it at 100 chars BEFORE the lookup
 *     (slug column is varchar; long inputs are almost certainly hostile and
 *     would never match). The capped value is still looked up so the caller
 *     can render a "no match" state with the user's intent preserved.
 *   - On Postgres error: throws. This is unexpected; the page error boundary
 *     handles it. The helper deliberately does NOT swallow DB errors.
 *
 * Assumes the supabase client is already staff-authenticated by the caller
 * (`fetchAdminRequests` / `fetchAdminAutomations` both call
 * `assertPlatformStaff` before invoking this helper).
 */
export async function resolveOrgIdentifier(
  supabase: SupabaseClient,
  raw: string | null | undefined
): Promise<ResolveOrgIdentifierResult> {
  if (raw == null) {
    return { orgId: null, resolvedOrg: null, orgIdentifierProvided: null };
  }
  const trimmed = raw.trim().slice(0, IDENTIFIER_MAX_LENGTH);
  if (trimmed.length === 0) {
    return { orgId: null, resolvedOrg: null, orgIdentifierProvided: null };
  }

  const column = isUuid(trimmed) ? "id" : "slug";

  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq(column, trimmed)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;

  const row = data as { id: string; name: string; slug: string } | null;

  if (!row) {
    return {
      orgId: null,
      resolvedOrg: null,
      orgIdentifierProvided: trimmed,
    };
  }

  return {
    orgId: row.id,
    resolvedOrg: row,
    orgIdentifierProvided: trimmed,
  };
}
