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
