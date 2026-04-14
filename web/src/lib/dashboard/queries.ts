import { createClient } from "@/lib/supabase/server";
import type { DashboardAutomation, DashboardExecution, DashboardNotification, KpiData, AutomationsPageAutomation, AutomationDetailData, AutomationExecutionEntry, WeeklyChartData, CatalogTemplate, CatalogTemplateDetail } from "./types";

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

/**
 * Group executions into 4 weekly buckets.
 * W1 = oldest week, W4 = most recent week.
 */
function groupByWeek(executions: { started_at: string }[], now: Date): WeeklyChartData[] {
  const buckets: WeeklyChartData[] = [
    { week: "W1", count: 0 },
    { week: "W2", count: 0 },
    { week: "W3", count: 0 },
    { week: "W4", count: 0 },
  ];

  const nowMs = now.getTime();

  executions.forEach((exec) => {
    const execMs = new Date(exec.started_at).getTime();
    const daysAgo = (nowMs - execMs) / (24 * 60 * 60 * 1000);
    // W4 = 0-7 days ago, W3 = 7-14 days ago, W2 = 14-21 days ago, W1 = 21-28 days ago
    if (daysAgo < 7) {
      buckets[3].count += 1;
    } else if (daysAgo < 14) {
      buckets[2].count += 1;
    } else if (daysAgo < 21) {
      buckets[1].count += 1;
    } else {
      buckets[0].count += 1;
    }
  });

  return buckets;
}

/**
 * Fetch automations for the My Automations list page.
 * Returns automations with template data and monthly execution counts.
 */
export async function fetchAutomationsPage(orgId: string): Promise<AutomationsPageAutomation[]> {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Fetch automations with template join
  const { data: automationsData, error: automationsError } = await supabase
    .from("automations")
    .select(`
      id, name, status, last_run_at,
      template:automation_templates(
        category,
        connected_apps,
        activity_metric_label,
        avg_minutes_per_task,
        monthly_price
      )
    `)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .not("status", "eq", "archived");

  if (automationsError) throw automationsError;

  const automations = (automationsData ?? []) as unknown as AutomationsPageAutomation[];
  const orgAutomationIds = automations.map((a) => a.id);

  // 2. Fetch monthly execution counts in parallel (scoped to org automation IDs)
  let monthlyCounts = new Map<string, number>();
  if (orgAutomationIds.length > 0) {
    const { data: monthlyExecs } = await supabase
      .from("automation_executions")
      .select("automation_id")
      .eq("status", "success")
      .gte("started_at", monthStart)
      .in("automation_id", orgAutomationIds);

    (monthlyExecs ?? []).forEach((e: any) => {
      monthlyCounts.set(e.automation_id, (monthlyCounts.get(e.automation_id) ?? 0) + 1);
    });
  }

  // 3. Attach monthly_execution_count to each automation
  automations.forEach((a) => {
    a.monthly_execution_count = monthlyCounts.get(a.id) ?? 0;
  });

  // 4. Sort: active first, in_setup second, paused third, then alphabetical within groups
  const STATUS_ORDER: Record<string, number> = {
    active: 0,
    in_setup: 1,
    paused: 2,
    pending_review: 3,
    failed: 4,
    draft: 5,
    archived: 6,
  };

  automations.sort((a, b) => {
    const orderDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });

  return automations;
}

/**
 * Fetch full detail data for a single automation.
 * Returns automation, last 20 executions, weekly chart data, monthly metric count, and hours saved.
 */
export async function fetchAutomationDetail(automationId: string, orgId: string): Promise<{
  automation: AutomationDetailData;
  executions: AutomationExecutionEntry[];
  weeklyData: WeeklyChartData[];
  monthlyMetricCount: number;
  hoursSaved: number;
}> {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString();

  // Run all 4 queries in parallel
  const [automationResult, executionsResult, weeklyExecsResult, monthlyCountResult] =
    await Promise.all([
      // 1. Single automation with template join
      supabase
        .from("automations")
        .select(`
          id, name, status,
          template:automation_templates(
            category,
            connected_apps,
            activity_metric_label,
            avg_minutes_per_task,
            monthly_price
          )
        `)
        .eq("id", automationId)
        .eq("organization_id", orgId)
        .single(),

      // 2. Last 20 executions
      supabase
        .from("automation_executions")
        .select("id, status, started_at, completed_at, duration_ms, error_message")
        .eq("automation_id", automationId)
        .order("started_at", { ascending: false })
        .limit(20),

      // 3. 28-day executions for weekly chart (success only)
      supabase
        .from("automation_executions")
        .select("started_at")
        .eq("automation_id", automationId)
        .eq("status", "success")
        .gte("started_at", fourWeeksAgo),

      // 4. Monthly metric count (success only)
      supabase
        .from("automation_executions")
        .select("*", { count: "exact", head: true })
        .eq("automation_id", automationId)
        .eq("status", "success")
        .gte("started_at", monthStart),
    ]);

  if (automationResult.error) throw automationResult.error;

  const automation = automationResult.data as unknown as AutomationDetailData;
  const executions = (executionsResult.data ?? []) as unknown as AutomationExecutionEntry[];
  const weeklyExecs = (weeklyExecsResult.data ?? []) as { started_at: string }[];
  const monthlyMetricCount = monthlyCountResult.count ?? 0;

  // Compute weekly chart data
  const weeklyData = groupByWeek(weeklyExecs, now);

  // Compute hours saved: monthly count * avg_minutes_per_task / 60 (1 decimal)
  const avgMinutes = automation.template?.avg_minutes_per_task ?? 0;
  const hoursSaved = Math.round((monthlyMetricCount * avgMinutes) / 60 * 10) / 10;

  return { automation, executions, weeklyData, monthlyMetricCount, hoursSaved };
}

/**
 * Fetch all active catalog templates sorted by sort_order.
 * Returns fields needed for the catalog grid cards.
 */
export async function fetchCatalogTemplates(): Promise<CatalogTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_templates")
    .select(`
      id, name, slug, category, icon,
      setup_price, monthly_price,
      industry_tags, connected_apps,
      is_featured, sort_order
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as CatalogTemplate[];
}

/**
 * Fetch a single active catalog template by slug.
 * Returns all detail fields for the template detail page.
 * Returns null if not found or not active.
 */
export async function fetchTemplateBySlug(slug: string): Promise<CatalogTemplateDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("automation_templates")
    .select(`
      id, name, slug, description, category, icon,
      setup_price, monthly_price, setup_time_days,
      industry_tags, connected_apps,
      typical_impact_text, avg_minutes_per_task, activity_metric_label,
      is_featured, sort_order
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as unknown as CatalogTemplateDetail;
}
