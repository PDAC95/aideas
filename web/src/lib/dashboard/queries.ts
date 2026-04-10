import { createClient } from "@/lib/supabase/server";
import type { DashboardAutomation, DashboardExecution, DashboardNotification, KpiData } from "./types";

/**
 * Get the user's organization_id from organization_members table.
 * profiles table does NOT have org_id — must use organization_members.
 */
export async function getOrgId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .single();
  return data?.organization_id ?? null;
}

/**
 * Fetch all dashboard data in parallel for the main dashboard page.
 * Returns automations, recent executions, notifications, and computed KPIs.
 */
export async function fetchDashboardData(userId: string, orgId: string) {
  const supabase = await createClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch automations with template data (exclude archived and deleted)
  const automationsPromise = supabase
    .from("automations")
    .select(`
      id, name, status, last_run_at,
      template:automation_templates(
        connected_apps,
        activity_metric_label,
        avg_minutes_per_task
      )
    `)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .not("status", "eq", "archived")
    .order("created_at", { ascending: false });

  // 2. Fetch notifications for the bell dropdown (last 20 for this user)
  const notificationsPromise = supabase
    .from("notifications")
    .select("id, type, title, message, is_read, read_at, link, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const [automationsResult, notificationsResult] = await Promise.all([
    automationsPromise,
    notificationsPromise,
  ]);

  const automations = (automationsResult.data ?? []) as unknown as DashboardAutomation[];
  const notifications = (notificationsResult.data ?? []) as unknown as DashboardNotification[];

  // Get org automation IDs for scoped queries
  const orgAutomationIds = automations.map((a) => a.id);

  // 3. Fetch last 15 executions for activity feed scoped to org automations
  let executions: DashboardExecution[] = [];
  if (orgAutomationIds.length > 0) {
    const { data: executionsData } = await supabase
      .from("automation_executions")
      .select(`
        id, automation_id, status, started_at, completed_at, error_message,
        automation:automations!inner(name)
      `)
      .in("automation_id", orgAutomationIds)
      .order("started_at", { ascending: false })
      .limit(15);
    executions = (executionsData ?? []) as unknown as DashboardExecution[];
  }

  // Compute KPIs
  let kpis: KpiData = { activeAutomations: 0, tasksThisWeek: 0, hoursSavedThisMonth: 0 };

  if (orgAutomationIds.length > 0) {
    // KPI 1: Count active automations
    const activeCount = automations.filter((a) => a.status === "active").length;

    // KPI 2: Tasks this week — count executions in last 7 days
    const { count: weeklyTasks } = await supabase
      .from("automation_executions")
      .select("*", { count: "exact", head: true })
      .in("automation_id", orgAutomationIds)
      .gte("started_at", weekAgo);

    // KPI 3: Hours saved this month
    // Fetch month executions with template avg_minutes_per_task via automation join
    const { data: monthExecs } = await supabase
      .from("automation_executions")
      .select(`
        id, status,
        automation:automations!inner(
          template:automation_templates(avg_minutes_per_task)
        )
      `)
      .in("automation_id", orgAutomationIds)
      .eq("status", "success")
      .gte("started_at", monthStart);

    const totalMinutes = (monthExecs ?? []).reduce((sum: number, exec: any) => {
      const minutes = exec.automation?.template?.avg_minutes_per_task ?? 0;
      return sum + minutes;
    }, 0);

    kpis = {
      activeAutomations: activeCount,
      tasksThisWeek: weeklyTasks ?? 0,
      hoursSavedThisMonth: Math.round((totalMinutes / 60) * 10) / 10, // 1 decimal
    };
  }

  // Compute daily execution count per automation (last 24h)
  if (orgAutomationIds.length > 0) {
    const { data: dailyExecs } = await supabase
      .from("automation_executions")
      .select("automation_id")
      .in("automation_id", orgAutomationIds)
      .gte("started_at", dayAgo);

    const dailyCounts = new Map<string, number>();
    (dailyExecs ?? []).forEach((e: any) => {
      dailyCounts.set(e.automation_id, (dailyCounts.get(e.automation_id) ?? 0) + 1);
    });

    automations.forEach((a) => {
      a.daily_execution_count = dailyCounts.get(a.id) ?? 0;
    });
  }

  return { automations, executions, notifications, kpis };
}
