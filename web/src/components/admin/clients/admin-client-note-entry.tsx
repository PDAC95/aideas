"use client";

import { useState, useTransition } from "react";
import { updateNote, deleteNote } from "@/lib/actions/admin-clients";
import { NOTE_MIN, NOTE_MAX } from "@/lib/validations/admin-client-note";
import type { AdminClientNoteEntry as AdminClientNoteEntryData } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

interface AdminClientNoteEntryProps {
  note: AdminClientNoteEntryData;
  locale: string;
  translations: {
    edit: string;
    delete: string;
    save: string;
    saving: string;
    cancel: string;
    confirmDelete: string;
    confirmDeleteBody: string;
    deleting: string;
    edited: string;
    writtenBy: string; // template "{name} on {date}"
    errorTooShort: string;
    errorTooLong: string;
    errorGeneric: string;
    charCounter: string; // template "{n} / {max}"
  };
}

/**
 * Per-existing-note view/edit/delete component. Owns its own three-state
 * machine: "view" (default) -> "edit" (textarea + Save/Cancel) or
 * "confirm-delete" (inline modal-like panel + Confirm/Cancel).
 *
 * Inline confirm-delete (NOT a portal Dialog) — the project's shadcn/ui set
 * does not ship Dialog, and the inline panel is simpler / accessible /
 * dependency-free.
 *
 * SECURITY: note body rendered as plain JSX text inside whitespace-pre-wrap
 * <p>. React's default escaping is the entire XSS defense.
 */
export function AdminClientNoteEntry({
  note,
  locale,
  translations,
}: AdminClientNoteEntryProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [body, setBody] = useState(note.body);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const authorLabel = note.authorFullName ?? note.authorEmail;
  const meta = translations.writtenBy
    .replace("{name}", authorLabel)
    .replace("{date}", dateFmt.format(new Date(note.createdAt)));

  // 1-second tolerance: the update_updated_at_column trigger doesn't fire on
  // INSERT (the column DEFAULTs to NOW()), but cross-replica clock skew can
  // make a freshly-inserted row's updated_at come back microseconds ahead of
  // created_at. 1s is wider than any clock skew, tighter than any human edit.
  const wasEdited =
    new Date(note.updatedAt).getTime() >
    new Date(note.createdAt).getTime() + 1000;

  const trimmedLength = body.trim().length;
  const tooLong = body.length > NOTE_MAX;
  // Block Save when body is unchanged — avoids a needless DB write that bumps
  // updated_at and adds a bogus "(edited)" marker.
  const canSave =
    trimmedLength >= NOTE_MIN &&
    !tooLong &&
    !isPending &&
    body.trim() !== note.body.trim();

  const onSaveEdit = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateNote({ noteId: note.id, body });
      if (!res.ok) {
        if (res.fieldError?.code === "body_too_short")
          setError(translations.errorTooShort);
        else if (res.fieldError?.code === "body_too_long")
          setError(translations.errorTooLong);
        else setError(translations.errorGeneric);
        return;
      }
      setMode("view");
    });
  };

  const onCancelEdit = () => {
    setBody(note.body);
    setError(null);
    setMode("view");
  };

  const onConfirmDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteNote({ noteId: note.id });
      if (!res.ok) {
        setError(translations.errorGeneric);
        setMode("view");
      }
      // On success the page revalidates and the entry vanishes from the list.
    });
  };

  if (mode === "edit") {
    const counterLabel = translations.charCounter
      .replace("{n}", String(body.length))
      .replace("{max}", String(NOTE_MAX));
    return (
      <div className="space-y-2 rounded-md border border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-gray-900">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          autoFocus
          className="block w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
        />
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              tooLong
                ? "text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            {counterLabel}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isPending}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {translations.cancel}
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={!canSave}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-white",
                canSave
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "cursor-not-allowed bg-purple-300 dark:bg-purple-900"
              )}
            >
              {isPending ? translations.saving : translations.save}
            </button>
          </div>
        </div>
        {error && (
          <p
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <div className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          {translations.confirmDelete}
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">
          {translations.confirmDeleteBody}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setMode("view")}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {translations.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {isPending ? translations.deleting : translations.delete}
          </button>
        </div>
        {error && (
          <p
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  // mode === "view"
  return (
    <article className="space-y-2 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
        {note.body}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {meta}
          {wasEdited && (
            <span className="ml-2 italic">{translations.edited}</span>
          )}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="text-purple-700 hover:underline dark:text-purple-300"
          >
            {translations.edit}
          </button>
          <button
            type="button"
            onClick={() => setMode("confirm-delete")}
            className="text-red-600 hover:underline dark:text-red-400"
          >
            {translations.delete}
          </button>
        </div>
      </div>
      {error && (
        <p
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </article>
  );
}
