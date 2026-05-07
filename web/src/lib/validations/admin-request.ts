import { z } from "zod";

// Loose UUID-shape regex (8-4-4-4-12 hex) — matches Phase 18's pattern for
// the seed's non-RFC UUIDs.
const uuidShape = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "invalid_id"
);

export const REJECT_REASON_MIN = 10;
export const REJECT_REASON_MAX = 500;

export const approveRequestSchema = z.object({
  requestId: uuidShape,
});

export const rejectRequestSchema = z.object({
  requestId: uuidShape,
  reason: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(REJECT_REASON_MIN, "reason_too_short")
        .max(REJECT_REASON_MAX, "reason_too_long")
    ),
});

export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;
