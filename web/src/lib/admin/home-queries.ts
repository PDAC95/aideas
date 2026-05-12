import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import { TAB_TO_STATUSES } from "./types";
import type { AdminHomeKpis } from "./types";

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
