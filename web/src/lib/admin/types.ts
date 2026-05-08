/**
 * Real DB statuses for automation_requests. The `status` column has a CHECK
 * constraint that allows all 7 values below. The admin Requests Inbox surfaces
 * all 7 in its row badges, but groups them into 3 UI tabs (see
 * AdminRequestTab + TAB_TO_STATUSES below).
 *
 * - `pending`         : new, awaiting staff triage (the only status that can be
 *                       approved/rejected from the inbox UI).
 * - `in_review`       : staff started looking at it but hasn't decided.
 * - `approved`        : staff approved → an automation row was provisioned.
 * - `completed`       : terminal post-approved state (work delivered).
 * - `rejected`        : staff rejected with a reason.
 * - `payment_pending` : awaiting customer payment (Stripe-driven, v1.3+).
 * - `payment_failed`  : Stripe charge failed; customer needs to retry.
 */
export type AdminRequestStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "completed"
  | "rejected"
  | "payment_pending"
  | "payment_failed";

/**
 * UI tab grouping for the Requests Inbox. NOT the same as the DB status.
 * Three tabs cover all 7 real statuses; see TAB_TO_STATUSES.
 */
export type AdminRequestTab = "pending" | "approved" | "rejected";

/**
 * Tab → DB-status grouping used by both the list query and the tab counters.
 *
 * - "pending"  tab surfaces actionable + intermediate + payment-stuck rows so
 *              nothing falls through the cracks (status='pending' is the only
 *              one approvable/rejectable from the UI; the other three are
 *              shown for visibility but their action buttons stay hidden).
 * - "approved" tab includes `completed` so post-approval work also shows here.
 * - "rejected" tab is the single rejected status.
 */
export const TAB_TO_STATUSES: Record<
  AdminRequestTab,
  readonly AdminRequestStatus[]
> = {
  pending: ["pending", "in_review", "payment_pending", "payment_failed"],
  approved: ["approved", "completed"],
  rejected: ["rejected"],
} as const;

export interface AdminRequestRow {
  id: string;
  organizationId: string;
  organizationName: string;
  templateId: string | null;
  templateDisplayName: string; // falls back to slug, then to title if no template_id
  status: AdminRequestStatus; // real DB value, used by the badge
  customRequirementsPreview: string; // first ~80 chars of description
  createdAt: string; // ISO 8601
}

export interface AdminRequestDetail {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  organizationCreatedAt: string;
  organizationPlan: string | null; // from subscriptions.plan, may be null if no row
  organizationActiveAutomationsCount: number;
  requesterUserId: string;
  requesterFullName: string | null;
  requesterEmail: string;
  templateId: string | null;
  templateSlug: string | null;
  templateDisplayName: string;
  title: string;
  customRequirements: string; // full description text
  urgency: "low" | "normal" | "urgent" | string;
  status: AdminRequestStatus; // real DB value
  notes: string | null; // rejection reason once rejected
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // Result links derived by the detail page; we only carry the IDs needed:
  resultingAutomationId: string | null; // populated when status='approved' AND we successfully match
}

/**
 * Tab counters (NOT per-status counters). The list page renders 3 tabs, so
 * we count rows grouped by tab.
 */
export interface AdminRequestStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * The 7 real status values for `automations.status` (CHECK constraint set by
 * migration 20260305000002 + 20260409000001 in_setup expansion).
 */
export type AdminAutomationStatus =
  | "draft"
  | "pending_review"
  | "in_setup"
  | "active"
  | "paused"
  | "failed"
  | "archived";

/**
 * Status tabs surfaced in the admin Automations list. Default tab is "active"
 * (the most-trafficked operational view). The 5 main statuses each get a tab;
 * "draft" and "pending_review" are folded into a single non-default catch-all
 * tab "other" that is rendered ONLY when count(draft) + count(pending_review)
 * > 0 (per Phase 20-04 gap closure — closes the only partial gap from
 * 20-VERIFICATION.md). When both counts are zero the "other" tab is hidden
 * and the strip shows the original 5 tabs only.
 */
export type AdminAutomationTab =
  | "active"
  | "in_setup"
  | "paused"
  | "failed"
  | "archived"
  | "other";

export const ADMIN_AUTOMATION_TABS: readonly AdminAutomationTab[] = [
  "active",
  "in_setup",
  "paused",
  "failed",
  "archived",
  "other",
] as const;

/**
 * Tab counters — one number per tab. Used by the list page to render
 * "(N)" on each tab without an extra round trip per tab.
 */
export type AdminAutomationStatusCounts = Record<AdminAutomationTab, number>;

/**
 * Single row in the admin automations list table. The 6 columns the table
 * renders map 1:1 to fields below; `id` is carried for the row link.
 */
export interface AdminAutomationRow {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  templateId: string | null;
  templateDisplayName: string | null; // null when template_id is null (custom automation)
  status: AdminAutomationStatus | string; // string for forward-compat
  executionsCount: number;
  createdAt: string; // ISO 8601
}

/**
 * Filter-bar option shapes. Org and Template dropdowns are populated by
 * fetchAdminAutomationFilterOptions, which returns the orgs and templates
 * that have at least one automation row. Empty values mean "no filter".
 */
export interface AdminAutomationOrgOption {
  id: string;
  name: string;
}

export interface AdminAutomationTemplateOption {
  id: string;
  displayName: string;
}

/**
 * Combined input shape for fetchAdminAutomations. The list page parses
 * searchParams into this shape and passes it through.
 */
export interface AdminAutomationListFilters {
  tab: AdminAutomationTab;
  organizationId: string | null;
  templateId: string | null;
  nameQuery: string | null;
  locale: string;
}

/**
 * Single execution entry surfaced in the admin detail timeline.
 *
 * `durationMs` is the raw milliseconds duration from the DB column
 * `automation_executions.duration_ms` (plain INTEGER — see migration
 * 20260305000002 line 120). The timeline component computes
 * Math.round(durationMs / 1000) before substituting into the i18n template
 * `{seconds}s` for a friendlier display.
 */
export interface AdminAutomationExecutionEntry {
  id: string;
  status: "running" | "success" | "error" | "cancelled" | string;
  startedAt: string;          // ISO 8601
  completedAt: string | null; // ISO 8601 or null while running
  durationMs: number | null;
  errorMessage: string | null;
}

/**
 * Full detail object backing /admin/automations/[id]. Composed in one fn call;
 * carries the four KPI values precomputed by the query layer so the UI is a
 * pure render.
 */
export interface AdminAutomationDetail {
  id: string;
  name: string;
  description: string | null;
  status: AdminAutomationStatus | string;
  setupNotes: string | null;
  createdAt: string;
  updatedAt: string;
  lastRunAt: string | null;

  // Org card data
  organizationId: string;
  organizationName: string;
  organizationSlug: string;

  // Template card data (may be all-null for custom automations)
  templateId: string | null;
  templateSlug: string | null;
  templateDisplayName: string | null;
  templateCategory: string | null;
  templateMonthlyPriceCents: number | null;

  // KPIs (precomputed)
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number | null;        // 0..1, or null when totalExecutions=0
  hoursSaved: number;                 // rounded to 1 decimal place

  // Last-20 execution timeline
  recentExecutions: AdminAutomationExecutionEntry[];
}
