import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import type {
  AdminAutomationRow,
  AdminAutomationStatusCounts,
  AdminAutomationOrgOption,
  AdminAutomationTemplateOption,
  AdminAutomationListFilters,
} from "./types";
import { ADMIN_AUTOMATION_TABS } from "./types";

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
 */
export async function fetchAdminAutomations(
  filters: AdminAutomationListFilters
): Promise<AdminAutomationRow[]> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminAutomations: not authorized (${auth.error})`);
  }

  // Filter chain order MUST match request-queries.ts verbatim:
  //   1. .eq("status", ...).is("deleted_at", null)
  //   2. The two translation .eq calls (locale + field) IMMEDIATELY after
  //   3. Optional filters (organizationId / templateId / nameQuery)
  //   4. Final .order(...) call
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
    )
    .eq("status", filters.tab) // tab values map 1:1 to real DB statuses
    .is("deleted_at", null)
    .eq("template.translations.locale", filters.locale)
    .eq("template.translations.field", "name");

  // Optional filters AFTER the translation .eq calls (matches request-queries.ts).
  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
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

  return rows.map((row) => {
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
  });
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
      const { count, error } = await supabase
        .from("automations")
        .select("id", { count: "exact", head: true })
        .eq("status", tab)
        .is("deleted_at", null);
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
