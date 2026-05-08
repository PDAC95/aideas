"use server";

import { revalidatePath } from "next/cache";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
  type DeleteNoteInput,
} from "@/lib/validations/admin-client-note";

type ZodFieldError = {
  field: "body";
  code: "body_too_short" | "body_too_long";
};

export type CreateNoteResult =
  | { ok: true; noteId: string }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "insert_failed";
      fieldError?: ZodFieldError;
    };

export type UpdateNoteResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "update_failed";
      fieldError?: ZodFieldError;
    };

export type DeleteNoteResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalid_input"
        | "not_authenticated"
        | "not_staff"
        | "not_found"
        | "delete_failed";
    };

/**
 * Extract a typed body field error from Zod issues. The bodySchema's
 * transform-then-pipe shape yields issues at `path: ["body"]` whose `message`
 * is one of the two custom codes ("body_too_short" / "body_too_long"); any
 * other path or message returns undefined.
 */
function bodyFieldErrorFromZod(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>
): ZodFieldError | undefined {
  const bodyIssue = issues.find((i) => i.path[0] === "body");
  if (!bodyIssue) return undefined;
  if (bodyIssue.message === "body_too_short")
    return { field: "body", code: "body_too_short" };
  if (bodyIssue.message === "body_too_long")
    return { field: "body", code: "body_too_long" };
  return undefined;
}

/**
 * Create a new internal note attached to an organization.
 *
 * Author = the calling staff user (auth.uid()).
 * Returns the new noteId on success.
 *
 * Pre-flight verifies the org exists and is not soft-deleted (defense in
 * depth — RLS would let an org-id-pointer-mismatch insert succeed otherwise).
 *
 * Notes are admin-internal: NO `notifyOrgMembers` fan-out (would leak the
 * existence of internal notes to customers).
 */
export async function createNote(
  input: CreateNoteInput
): Promise<CreateNoteResult> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldError: bodyFieldErrorFromZod(parsed.error.issues),
    };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", parsed.data.organizationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (orgError) {
    console.error("[admin-clients:createNote] org_lookup_failed", {
      error: orgError,
    });
    return { ok: false, error: "insert_failed" };
  }
  if (!org) return { ok: false, error: "not_found" };

  const { data: inserted, error: insertError } = await supabase
    .from("organization_notes")
    .insert({
      organization_id: parsed.data.organizationId,
      author_id: auth.userId,
      body: parsed.data.body,
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    console.error("[admin-clients:createNote] insert_failed", {
      organizationId: parsed.data.organizationId,
      error: insertError,
    });
    return { ok: false, error: "insert_failed" };
  }

  revalidatePath(`/admin/clients/${parsed.data.organizationId}`);
  return { ok: true, noteId: inserted.id };
}

/**
 * Update an existing note's body. Any platform_staff member can edit any note
 * (CONTEXT.md "any staff can edit any note ... small team, high trust").
 *
 * No optimistic concurrency control: concurrent edits where two staff click
 * Save within milliseconds simply produce a last-writer-wins outcome. The
 * body is short; conflicts are recoverable by reading + retyping.
 *
 * The DB trigger from Plan 21-01 (update_updated_at_column) keeps updated_at
 * fresh on every UPDATE.
 */
export async function updateNote(
  input: UpdateNoteInput
): Promise<UpdateNoteResult> {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_input",
      fieldError: bodyFieldErrorFromZod(parsed.error.issues),
    };
  }

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  // Pre-flight load: needed so we can revalidate the correct org page.
  const { data: row, error: rowError } = await supabase
    .from("organization_notes")
    .select("id, organization_id")
    .eq("id", parsed.data.noteId)
    .maybeSingle();
  if (rowError) {
    console.error("[admin-clients:updateNote] lookup_failed", {
      error: rowError,
    });
    return { ok: false, error: "update_failed" };
  }
  if (!row) return { ok: false, error: "not_found" };

  const { error: updateError } = await supabase
    .from("organization_notes")
    .update({ body: parsed.data.body })
    .eq("id", parsed.data.noteId);
  if (updateError) {
    console.error("[admin-clients:updateNote] update_failed", {
      noteId: parsed.data.noteId,
      error: updateError,
    });
    return { ok: false, error: "update_failed" };
  }

  revalidatePath(`/admin/clients/${row.organization_id}`);
  return { ok: true };
}

/**
 * Delete a note. Hard delete — the table has no `deleted_at` column and
 * CONTEXT.md positions notes as a "running log" not an audit log.
 *
 * Pre-flight load is needed so we can revalidate the correct org page after
 * the row is gone.
 */
export async function deleteNote(
  input: DeleteNoteInput
): Promise<DeleteNoteResult> {
  const parsed = deleteNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);
  if (!auth.ok) {
    if (auth.error === "not_authenticated")
      return { ok: false, error: "not_authenticated" };
    return { ok: false, error: "not_staff" };
  }

  const { data: row, error: rowError } = await supabase
    .from("organization_notes")
    .select("id, organization_id")
    .eq("id", parsed.data.noteId)
    .maybeSingle();
  if (rowError) {
    console.error("[admin-clients:deleteNote] lookup_failed", {
      error: rowError,
    });
    return { ok: false, error: "delete_failed" };
  }
  if (!row) return { ok: false, error: "not_found" };

  const { error: deleteError } = await supabase
    .from("organization_notes")
    .delete()
    .eq("id", parsed.data.noteId);
  if (deleteError) {
    console.error("[admin-clients:deleteNote] delete_failed", {
      noteId: parsed.data.noteId,
      error: deleteError,
    });
    return { ok: false, error: "delete_failed" };
  }

  revalidatePath(`/admin/clients/${row.organization_id}`);
  return { ok: true };
}
