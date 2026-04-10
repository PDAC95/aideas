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
