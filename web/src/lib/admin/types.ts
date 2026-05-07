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
