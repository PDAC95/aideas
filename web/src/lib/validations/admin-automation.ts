import { z } from "zod";

const uuidShape = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "invalid_id"
  );

/**
 * The four expected_status values the client may pass to a transition action,
 * one per starting state of an allowed transition:
 *   - "in_setup" -> activate
 *   - "active"   -> pause OR archive
 *   - "paused"   -> resume OR archive
 */
export const ALLOWED_EXPECTED_STATUSES = [
  "in_setup",
  "active",
  "paused",
] as const;

const expectedStatusShape = z.enum(ALLOWED_EXPECTED_STATUSES);

/**
 * Common input shape for activate/pause/resume/archive. The four actions all
 * take the same shape; each action constrains `expected_status` to the value(s)
 * it accepts at the action body level (not at the schema level — Zod accepts
 * any of the three so a single helper can pre-validate; the action itself
 * enforces the specific transition).
 */
export const transitionAutomationSchema = z.object({
  automationId: uuidShape,
  expectedStatus: expectedStatusShape,
});

export type TransitionAutomationInput = z.infer<
  typeof transitionAutomationSchema
>;
