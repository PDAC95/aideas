import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import { TAB_TO_STATUSES } from "./types";
import type { AdminHomeKpis, AdminHomeActivityEntry } from "./types";

const ACTIVITY_FEED_LIMIT = 20;
const PER_SOURCE_LIMIT = 20;

/**
 * Fetch the 4 live KPIs for the admin home page.
 *
 * Strategy: 4 HEAD-only `count: 'exact'` queries issued in parallel via
 * Promise.all. No row payload is transferred — only the counts. Mirrors the
 * pattern in request-queries.ts:114 (fetchAdminRequestStatusCounts).
 *
 * `signupsThisWeek` uses a rolling 7-day window (now() - 7 days, inclusive of
 * now). Per CONTEXT.md Claude's-discretion item: "rolling 7-day window is
 * simpler than calendar week". The cutoff is computed in JS to keep the
 * query expression DB-agnostic.
 *
 * Throws on auth failure (admin layout already gates the route) or on any
 * Supabase error.
 */
export async function fetchAdminHomeKpis(): Promise<AdminHomeKpis> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminHomeKpis: not authorized (${auth.error})`);
  }

  const sevenDaysAgoIso = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    pendingRequestsRes,
    inSetupAutomationsRes,
    activeClientsRes,
    signupsThisWeekRes,
  ] = await Promise.all([
    supabase
      .from("automation_requests")
      .select("id", { count: "exact", head: true })
      .in("status", TAB_TO_STATUSES.pending as unknown as string[])
      .is("deleted_at", null),
    supabase
      .from("automations")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_setup")
      .is("deleted_at", null),
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", sevenDaysAgoIso),
  ]);

  if (pendingRequestsRes.error) throw pendingRequestsRes.error;
  if (inSetupAutomationsRes.error) throw inSetupAutomationsRes.error;
  if (activeClientsRes.error) throw activeClientsRes.error;
  if (signupsThisWeekRes.error) throw signupsThisWeekRes.error;

  return {
    pendingRequests: pendingRequestsRes.count ?? 0,
    inSetupAutomations: inSetupAutomationsRes.count ?? 0,
    activeClients: activeClientsRes.count ?? 0,
    signupsThisWeek: signupsThisWeekRes.count ?? 0,
  };
}

/**
 * Fetch the activity feed for the admin home page — last 20 events of the
 * 3 supported types, merged into a flat chronological list.
 *
 * Strategy: 3 parallel SELECTs (one per event type), each LIMIT 20 ordered
 * by the relevant timestamp DESC. After resolution, merge into a single
 * array, sort by occurredAt DESC, and slice to ACTIVITY_FEED_LIMIT.
 *
 * Pulling 20 per source ensures the global top-20 is preserved even when
 * one source dominates (e.g. 20 fresh signups in a day still leaves room
 * for the older request/automation rows to surface).
 *
 * `automation_activated` is approximated as "automation with status='active'
 * ordered by updated_at DESC". Phase 22 does NOT introduce an audit log;
 * `updated_at` is the closest proxy for "when did this become active".
 * False positives (an active automation re-saved for unrelated reasons)
 * are acceptable per CONTEXT.md (event-type selection prioritizes the
 * 3 highest-signal events; status_transition events were explicitly
 * deferred).
 */
export async function fetchAdminHomeActivity(): Promise<
  AdminHomeActivityEntry[]
> {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    throw new Error(`fetchAdminHomeActivity: not authorized (${auth.error})`);
  }

  const [requestsRes, automationsRes, signupsRes] = await Promise.all([
    // request_created: every automation_request, newest first
    supabase
      .from("automation_requests")
      .select(
        `id, title, created_at,
         organization:organizations!inner(id, name)`
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),

    // automation_activated: automations currently status='active', newest by updated_at
    supabase
      .from("automations")
      .select(
        `id, name, updated_at,
         organization:organizations!inner(id, name)`
      )
      .eq("status", "active")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),

    // new_signup: every org, newest first
    supabase
      .from("organizations")
      .select("id, name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),
  ]);

  if (requestsRes.error) throw requestsRes.error;
  if (automationsRes.error) throw automationsRes.error;
  if (signupsRes.error) throw signupsRes.error;

  type RawRequest = {
    id: string;
    title: string;
    created_at: string;
    organization:
      | { id: string; name: string }
      | Array<{ id: string; name: string }>
      | null;
  };
  type RawAutomation = {
    id: string;
    name: string;
    updated_at: string;
    organization:
      | { id: string; name: string }
      | Array<{ id: string; name: string }>
      | null;
  };
  type RawOrg = { id: string; name: string; created_at: string };

  // Defensive embed-shape normalization (Supabase JS sometimes returns single-row
  // !inner embeds as T, sometimes T[] — pattern documented in Phase 19+20+21
  // SUMMARYs).
  const normalizeOrg = (
    o:
      | { id: string; name: string }
      | Array<{ id: string; name: string }>
      | null
  ): { id: string; name: string } | null => {
    if (!o) return null;
    if (Array.isArray(o)) return o[0] ?? null;
    return o;
  };

  const fromRequests: AdminHomeActivityEntry[] = (
    (requestsRes.data ?? []) as unknown as RawRequest[]
  ).map((r) => {
    const org = normalizeOrg(r.organization);
    return {
      type: "request_created",
      entityId: r.id,
      href: `/admin/requests/${r.id}`,
      occurredAt: r.created_at,
      orgName: org?.name ?? "",
      requestTitle: r.title,
      automationName: null,
    };
  });

  const fromAutomations: AdminHomeActivityEntry[] = (
    (automationsRes.data ?? []) as unknown as RawAutomation[]
  ).map((a) => {
    const org = normalizeOrg(a.organization);
    return {
      type: "automation_activated",
      entityId: a.id,
      href: `/admin/automations/${a.id}`,
      occurredAt: a.updated_at,
      orgName: org?.name ?? "",
      requestTitle: null,
      automationName: a.name,
    };
  });

  const fromSignups: AdminHomeActivityEntry[] = (
    (signupsRes.data ?? []) as RawOrg[]
  ).map((o) => ({
    type: "new_signup",
    entityId: o.id,
    href: `/admin/clients/${o.id}`,
    occurredAt: o.created_at,
    orgName: o.name,
    requestTitle: null,
    automationName: null,
  }));

  const merged = [...fromRequests, ...fromAutomations, ...fromSignups];
  merged.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return merged.slice(0, ACTIVITY_FEED_LIMIT);
}
