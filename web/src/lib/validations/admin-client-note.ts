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

export const createNoteSchema = z.object({
  organizationId: z.string().uuid(),
  body: bodySchema,
});

export const updateNoteSchema = z.object({
  noteId: z.string().uuid(),
  body: bodySchema,
});

export const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
