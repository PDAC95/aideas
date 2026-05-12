import { z } from "zod";

/**
 * Body length bounds for an internal client note. Mirrored client-side via
 * `NOTE_MAX` in the textarea char counter so the UI stays in lockstep with
 * what the server will accept.
 *
 * MIN=1: short tags like "VIP" or "churn risk" are explicitly supported per
 * Phase 21 CONTEXT.md "running log" framing.
 * MAX=5000: covers any reasonable paragraph; tighter than the unbounded TEXT
 * column ceiling but loose enough for unconstrained operator typing.
 */
export const NOTE_MIN = 1;
export const NOTE_MAX = 5000;

/**
 * `transform(s => s.trim()).pipe(min/max)` ordering catches whitespace-only
 * input — matches the Phase 19 reject-reason validator verbatim.
 */
const bodySchema = z
  .string()
  .transform((s) => s.trim())
  .pipe(
    z.string().min(NOTE_MIN, "body_too_short").max(NOTE_MAX, "body_too_long")
  );

/**
 * Permissive UUID matcher: Postgres accepts any 8-4-4-4-12 hex string regardless
 * of RFC 4122 version field. Zod v4's `.uuid()` enforces `[1-8]` in the version
 * position, which rejects seed-style identifiers like
 * `bbbbbbbb-0000-0000-0000-000000000001`. We mirror Postgres semantics instead.
 */
const uuidLike = z
  .string()
  .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "invalid_uuid");

export const createNoteSchema = z.object({
  organizationId: uuidLike,
  body: bodySchema,
});

export const updateNoteSchema = z.object({
  noteId: uuidLike,
  body: bodySchema,
});

export const deleteNoteSchema = z.object({
  noteId: uuidLike,
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
