export interface DashboardAutomation {
  id: string;
  name: string; // i18n key from template
  status: 'active' | 'paused' | 'failed' | 'in_setup' | 'pending_review' | 'draft' | 'archived';
  last_run_at: string | null;
  template: {
    connected_apps: string[] | null;
    activity_metric_label: string | null;
    avg_minutes_per_task: number | null;
  } | null;
  daily_execution_count: number; // computed client-side from executions
}

export interface DashboardExecution {
  id: string;
  automation_id: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  automation: {
    name: string;
  };
}

export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'action_required';
  title: string;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  link: string | null;
  created_at: string;
}

export interface KpiData {
  activeAutomations: number;
  tasksThisWeek: number;
  hoursSavedThisMonth: number;
}

export interface AutomationsPageAutomation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'failed' | 'in_setup' | 'pending_review' | 'draft' | 'archived';
  last_run_at: string | null;
  template: {
    category: string;
    connected_apps: string[] | null;
    activity_metric_label: string | null;
    avg_minutes_per_task: number | null;
    monthly_price: number | null; // integer cents
  } | null;
  monthly_execution_count: number; // computed from executions
}

export interface AutomationDetailData {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'failed' | 'in_setup' | 'pending_review' | 'draft' | 'archived';
  template: {
    category: string;
    connected_apps: string[] | null;
    activity_metric_label: string | null;
    avg_minutes_per_task: number | null;
    monthly_price: number | null;
  } | null;
}

export interface AutomationExecutionEntry {
  id: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
}

export interface WeeklyChartData {
  week: string; // display label like "W1", "W2"
  count: number;
}

export interface CatalogTemplate {
  id: string;
  name: string;           // i18n key: "templates.{slug_snake}.name"
  slug: string;
  category: string;
  icon: string;
  setup_price: number;    // integer cents
  monthly_price: number;  // integer cents
  industry_tags: string[] | null;
  connected_apps: string[] | null;
  is_featured: boolean;
  sort_order: number;
}

export interface CatalogTemplateDetail extends CatalogTemplate {
  description: string;           // i18n key: "templates.{slug_snake}.description"
  typical_impact_text: string;   // i18n key: "templates.{slug_snake}.impact"
  setup_time_days: number;
  avg_minutes_per_task: number;
  activity_metric_label: string; // i18n key: "templates.{slug_snake}.metric_label"
}

export interface ReportsKpi {
  tasksCompleted: number;
  hoursSaved: number;
  estimatedValue: number | null; // null when org has no hourly_cost
  tasksChange: number | null;    // percentage change vs previous period (null if prev=0)
  hoursChange: number | null;
  valueChange: number | null;
}

export interface AutomationBreakdownRow {
  automationId: string;
  name: string;
  metricLabel: string;
  count: number;
  hoursSaved: number;
}

export interface ReportsData {
  kpi: ReportsKpi;
  weeklyChart: WeeklyChartData[];  // reuses existing WeeklyChartData (8 entries)
  breakdown: AutomationBreakdownRow[];
  hourlyCost: number | null;
}

export interface BillingAutomation {
  id: string;
  name: string;
  status: string;
  planLabel: string;       // e.g. "Pro", "Business" — derived from pricing_tier
  monthlyPrice: number;    // in cents (from template.monthly_price)
}

export interface BillingData {
  totalMonthlyCents: number;
  activeCount: number;
  nextChargeDate: string | null;   // ISO date string from subscriptions.current_period_end
  automations: BillingAutomation[];
  hourlyCost: number | null;
}

export interface SettingsProfileData {
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
}

export interface SettingsOrgData {
  orgId: string;
  orgName: string | null;
  hourlyCost: number | null;
  role: 'owner' | 'admin' | 'operator' | 'viewer';
}
