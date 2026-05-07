/**
 * Status values surfaced in the admin Requests Inbox. The DB enum has more
 * values (in_review, completed, payment_pending, payment_failed) but the inbox
 * only tabs on the three terminal-from-admin-view statuses; other statuses are
 * either intermediate (in_review) or owned by Stripe (payment_*) and surface
 * elsewhere in v1.3.
 */
export type AdminRequestStatus = "pending" | "approved" | "rejected";

export interface AdminRequestRow {
  id: string;
  organizationId: string;
  organizationName: string;
  templateId: string | null;
  templateDisplayName: string; // falls back to slug, then to title if no template_id
  status: AdminRequestStatus | string; // string for forward-compat with payment_* statuses if surfaced
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
  status: AdminRequestStatus | string;
  notes: string | null; // rejection reason once rejected
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // Result links derived by the detail page; we only carry the IDs needed:
  resultingAutomationId: string | null; // populated when status='approved' AND we successfully match
}

export interface AdminRequestStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}
