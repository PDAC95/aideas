import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import type {
  AdminAutomationRow,
  AdminAutomationStatusCounts,
  AdminAutomationOrgOption,
  AdminAutomationTemplateOption,
  AdminAutomationListFilters,
  AdminAutomationListResult,
  AdminAutomationDetail,
  AdminAutomationExecutionEntry,
} from "./types";
import { ADMIN_AUTOMATION_TABS } from "./types";
import { resolveOrgIdentifier } from "./org-identifier";

/**
 * List automations for the admin global view. The list returns rows for the
 * active tab + the three additional filters (org, template, name search).
 *
 * Joins:
 *   - organizations (for org name)
 *   - automation_templates LEFT (for slug + translations)
 *   - automation_template_translations LEFT filtered by locale + field='name'
 *     (resolves the human template name)
 *
 * Per-row execution count is computed via a second query against
 * automation_executions, bucketed in JS keyed by automation_id. We do this in
 * one round-trip rather than per-row to keep the list query cheap.
 *
 * Default order: created_at DESC (per CONTEXT.md). All tabs use this ordering.
 *
 * Filters combine with logical AND. Empty/null filter values are no-ops.
 *
 * Org filter (Phase 23): `filters.organizationId` is interpreted as
 * slug-OR-uuid via `resolveOrgIdentifier`. Pre-Phase-23 the field was
 * treated as a raw UUID, which silently produced empty results whenever a
 * caller passed a slug (the format the Client 360 tabs emit). The field
 * name is unchanged for callsite compatibility; the meaning is widened.
 * Unresolved identifiers short-circuit to an empty result with the user's
 * raw input echoed back via `orgFilter.orgIdentifierProvided`.
 */
export async function fetchAdminAutomations(
  filters: AdminAutomationListFilters
): Promise<AdminAutomationListResult> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminAutomations: not authorized (${auth.error})`);
  }

  const { orgId, resolvedOrg, orgIdentifierProvided } = await resolveOrgIdentifier(
    supabase,
    filters.organizationId
  );

  // Short-circuit: caller asked for an org filter, but the slug/uuid didn't
  // resolve. Skip the list query — pointless full-table scan — and let the
  // page render an explicit "Org not found" state.
  if (orgIdentifierProvided !== null && orgId === null) {
    return {
      rows: [],
      orgFilter: { resolvedOrg: null, orgIdentifierProvided },
    };
  }

  // Filter chain order MUST match request-queries.ts verbatim:
  //   1. Status filter (.eq for single-status tabs, .in for the "other" catch-all)
  //   2. .is("deleted_at", null)
  //   3. The two translation .eq calls (locale + field) IMMEDIATELY after
  //   4. Optional filters (organizationId / templateId / nameQuery)
  //   5. Final .order(...) call
  // Mixing this order has caused embedded-filter bugs in older postgrest-js.
  let query = supabase
    .from("automations")
    .select(
      `
      id, organization_id, template_id, name, status, created_at,
      organizations!inner(id, name),
      template:automation_templates!left(
        id, slug,
        translations:automation_template_translations!left(field, value, locale)
      )
      `
    );

  // Status filter — "other" is a UI-layer catch-all bucket for draft + pending_review;
  // every other tab maps 1:1 to a real DB status value.
  if (filters.tab === "other") {
    query = query.in("status", ["draft", "pending_review"]);
  } else {
    query = query.eq("status", filters.tab);
  }

  query = query
    .is("deleted_at", null)
    .eq("template.translations.locale", filters.locale)
    .eq("template.translations.field", "name");

  // Optional filters AFTER the translation .eq calls (matches request-queries.ts).
  if (orgId) {
    query = query.eq("organization_id", orgId);
  }
  if (filters.templateId) {
    query = query.eq("template_id", filters.templateId);
  }
  if (filters.nameQuery && filters.nameQuery.trim().length > 0) {
    // ilike: case-insensitive substring search on automation name. Postgres
    // pattern, escape % and _ in the input to prevent wildcard injection.
    const escaped = filters.nameQuery.trim().replace(/[%_]/g, (c) => `\\${c}`);
    query = query.ilike("name", `%${escaped}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;

  type RawRow = {
    id: string;
    organization_id: string;
    template_id: string | null;
    name: string;
    status: string;
    created_at: string;
    organizations: { id: string; name: string };
    template: {
      id: string;
      slug: string;
      translations: Array<{ field: string; value: string; locale: string }> | null;
    } | null;
  };

  const rows = (data ?? []) as unknown as RawRow[];
  const automationIds = rows.map((r) => r.id);

  // Per-row execution counts. One round trip; bucket in JS.
  const counts = new Map<string, number>();
  if (automationIds.length > 0) {
    const { data: execData, error: execError } = await supabase
      .from("automation_executions")
      .select("automation_id")
      .in("automation_id", automationIds);
    if (execError) throw execError;
    for (const row of (execData ?? []) as Array<{ automation_id: string }>) {
      counts.set(row.automation_id, (counts.get(row.automation_id) ?? 0) + 1);
    }
  }

  return {
    rows: rows.map((row) => {
      const tmplName = row.template?.translations?.[0]?.value ?? null;
      const fallback = row.template?.slug ?? null;
      return {
        id: row.id,
        name: row.name,
        organizationId: row.organization_id,
        organizationName: row.organizations.name,
        templateId: row.template_id,
        templateDisplayName: row.template_id ? tmplName ?? fallback : null,
        status: row.status,
        executionsCount: counts.get(row.id) ?? 0,
        createdAt: row.created_at,
      };
    }),
    orgFilter: { resolvedOrg, orgIdentifierProvided },
  };
}

/**
 * Tab counters. Five count-only HEAD queries (one per tab) issued in parallel
 * via Promise.all so the page header shows live numbers without scanning rows.
 */
export async function fetchAdminAutomationStatusCounts(): Promise<AdminAutomationStatusCounts> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(
      `fetchAdminAutomationStatusCounts: not authorized (${auth.error})`
    );
  }

  const results = await Promise.all(
    ADMIN_AUTOMATION_TABS.map(async (tab) => {
      // The "other" tab is a UI catch-all for draft + pending_review.
      // Issue an .in() HEAD count instead of .eq for that bucket.
      const baseQuery = supabase
        .from("automations")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      const filtered =
        tab === "other"
          ? baseQuery.in("status", ["draft", "pending_review"])
          : baseQuery.eq("status", tab);
      const { count, error } = await filtered;
      if (error) throw error;
      return [tab, count ?? 0] as const;
    })
  );

  const counts = {
    active: 0,
    in_setup: 0,
    paused: 0,
    failed: 0,
    archived: 0,
    other: 0,
  } as AdminAutomationStatusCounts;
  for (const [tab, n] of results) {
    counts[tab] = n;
  }
  return counts;
}

/**
 * Filter-dropdown options. Returns:
 *   - All orgs that have at least one non-deleted automation row
 *   - All templates that have at least one non-deleted automation row
 *
 * Both lists are deduped + alphabetized client-side. Volume is small (<= ~100
 * orgs, <= ~100 templates in v1.2 timeframe) so we do not paginate or search
 * at the dropdown level.
 */
export async function fetchAdminAutomationFilterOptions(input: {
  locale: string;
}): Promise<{
  orgs: AdminAutomationOrgOption[];
  templates: AdminAutomationTemplateOption[];
}> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(
      `fetchAdminAutomationFilterOptions: not authorized (${auth.error})`
    );
  }

  // One query: pull every non-deleted automation's (organization, template+translation)
  // and dedupe in JS.
  const { data, error } = await supabase
    .from("automations")
    .select(
      `
      organization_id, template_id,
      organizations!inner(id, name),
      template:automation_templates!left(
        id, slug,
        translations:automation_template_translations!left(field, value, locale)
      )
      `
    )
    .is("deleted_at", null)
    .eq("template.translations.locale", input.locale)
    .eq("template.translations.field", "name");

  if (error) throw error;

  type RawRow = {
    organization_id: string;
    template_id: string | null;
    organizations: { id: string; name: string };
    template: {
      id: string;
      slug: string;
      translations: Array<{ field: string; value: string; locale: string }> | null;
    } | null;
  };
  const rows = (data ?? []) as unknown as RawRow[];

  const orgMap = new Map<string, AdminAutomationOrgOption>();
  const tmplMap = new Map<string, AdminAutomationTemplateOption>();
  for (const r of rows) {
    if (!orgMap.has(r.organizations.id)) {
      orgMap.set(r.organizations.id, {
        id: r.organizations.id,
        name: r.organizations.name,
      });
    }
    if (r.template_id && r.template) {
      const displayName =
        r.template.translations?.[0]?.value ?? r.template.slug;
      if (!tmplMap.has(r.template_id)) {
        tmplMap.set(r.template_id, {
          id: r.template_id,
          displayName,
        });
      }
    }
  }

  const orgs = Array.from(orgMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const templates = Array.from(tmplMap.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  return { orgs, templates };
}

const TIMELINE_LIMIT = 20;

/**
 * Defensive embed-shape normalizer for Supabase JS PostgREST embeds.
 * !inner / !left embeds on UNIQUE-FK relations sometimes return as `T`
 * (single object) and sometimes as `T[]`. Normalize to `T | null`.
 *
 * Pattern established by Phase 19-01 (subscriptions embed); reused here for
 * automations -> organizations !inner and automations -> automation_templates !left.
 */
function singleEmbed<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

/**
 * Detail view: single automation + org + template (with translation) + 4 KPIs +
 * last-20 executions, all in two round trips:
 *   1. SELECT automation joined with organizations + automation_templates
 *      (+translation) + the template's avg_minutes_per_task (needed for hours
 *      saved). One query.
 *   2. SELECT all executions for this automation (id, status, started_at,
 *      completed_at, duration_ms, error_message). One query — used to
 *      compute totalExecutions, successfulExecutions, successRate, lastRunAt
 *      (already on the automation row but used as fallback if column is stale),
 *      AND to slice the last 20 for the timeline.
 *
 * If the automation row is soft-deleted or missing, returns null. The page
 * layer triggers notFound() on null.
 *
 * Throws on auth failure (admin layout already gates the route).
 */
export async function fetchAdminAutomationDetail(
  automationId: string,
  locale: string
): Promise<AdminAutomationDetail | null> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminAutomationDetail: not authorized (${auth.error})`);
  }

  const { data, error } = await supabase
    .from("automations")
    .select(
      `
      id, name, description, status, setup_notes, last_run_at, created_at, updated_at,
      organization:organizations!inner(id, name, slug),
      template:automation_templates!left(
        id, slug, category, monthly_price, avg_minutes_per_task,
        translations:automation_template_translations!left(field, value, locale)
      )
      `
    )
    .eq("id", automationId)
    .is("deleted_at", null)
    .eq("template.translations.locale", locale)
    .eq("template.translations.field", "name")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type RawTemplate = {
    id: string;
    slug: string;
    category: string;
    monthly_price: number | null;
    avg_minutes_per_task: number | null;
    translations: Array<{ field: string; value: string; locale: string }> | null;
  };
  type RawOrganization = { id: string; name: string; slug: string };
  type RawDetail = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    setup_notes: string | null;
    last_run_at: string | null;
    created_at: string;
    updated_at: string;
    organization: RawOrganization | RawOrganization[] | null;
    template: RawTemplate | RawTemplate[] | null;
  };
  const detail = data as unknown as RawDetail;

  // Defensive embed-shape normalization (see 20-01-SUMMARY gotcha).
  const organization = singleEmbed(detail.organization);
  const template = singleEmbed(detail.template);
  if (!organization) {
    // Should be impossible (FK + !inner), but if it ever happens, treat as 404.
    return null;
  }

  // Pull every execution for this automation. Volume is small per automation;
  // pull all (no pagination) so we can compute KPIs accurately AND slice the
  // last 20 for the timeline without a second query.
  const { data: execData, error: execError } = await supabase
    .from("automation_executions")
    .select(
      "id, status, started_at, completed_at, duration_ms, error_message"
    )
    .eq("automation_id", automationId)
    .order("started_at", { ascending: false });

  if (execError) throw execError;

  type RawExec = {
    id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    duration_ms: number | null;
    error_message: string | null;
  };
  const allExecs = (execData ?? []) as RawExec[];

  const totalExecutions = allExecs.length;
  const successfulExecutions = allExecs.filter(
    (e) => e.status === "success"
  ).length;
  const successRate =
    totalExecutions > 0 ? successfulExecutions / totalExecutions : null;

  // Hours saved = (successfulExecutions × avg_minutes_per_task) / 60
  // Rounded to 1 decimal place. Mirror the Phase 8 dashboard formula.
  const avgMinutes = template?.avg_minutes_per_task ?? 0;
  const totalMinutes = successfulExecutions * avgMinutes;
  const hoursSaved = Math.round((totalMinutes / 60) * 10) / 10;

  // Pull lastRunAt from the row column; fall back to the most recent execution
  // start time if the column lags.
  const lastRunAt = detail.last_run_at ?? allExecs[0]?.started_at ?? null;

  // Timeline: last 20 (allExecs is already DESC by started_at).
  const recentExecutions: AdminAutomationExecutionEntry[] = allExecs
    .slice(0, TIMELINE_LIMIT)
    .map((e) => ({
      id: e.id,
      status: e.status,
      startedAt: e.started_at,
      completedAt: e.completed_at,
      durationMs: e.duration_ms,
      errorMessage: e.error_message,
    }));

  // Template translation resolution.
  const tmplName = template?.translations?.[0]?.value ?? null;
  const tmplFallback = template?.slug ?? null;
  const templateDisplayName = template
    ? tmplName ?? tmplFallback
    : null;

  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    status: detail.status,
    setupNotes: detail.setup_notes,
    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
    lastRunAt,

    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,

    templateId: template?.id ?? null,
    templateSlug: template?.slug ?? null,
    templateDisplayName,
    templateCategory: template?.category ?? null,
    templateMonthlyPriceCents: template?.monthly_price ?? null,

    totalExecutions,
    successfulExecutions,
    successRate,
    hoursSaved,

    recentExecutions,
  };
}
