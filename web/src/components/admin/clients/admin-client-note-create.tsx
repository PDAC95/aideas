"use client";

import { useState, useTransition } from "react";
import { createNote } from "@/lib/actions/admin-clients";
import { NOTE_MIN, NOTE_MAX } from "@/lib/validations/admin-client-note";
import { cn } from "@/lib/utils";

interface AdminClientNoteCreateProps {
  organizationId: string;
  translations: {
    placeholder: string;
    save: string;
    saving: string;
    cancel: string;
    addLabel: string;
    errorTooShort: string;
    errorTooLong: string;
    errorGeneric: string;
    charCounter: string; // template "{n} / {max}"
  };
}

/**
 * "Add a note" form on the Notes tab. Starts collapsed (button only); opens
 * to a 5-row textarea with Save / Cancel buttons and a live char counter.
 *
 * Save invokes the createNote server action; on success the textarea clears,
 * the form collapses, and revalidatePath in the action triggers the parent
 * server component to re-render with the new note in the list.
 *
 * The Save button stays disabled while body.trim().length < NOTE_MIN, so the
 * client mirrors the server's bodySchema validation. The server still
 * re-validates and surfaces body_too_short / body_too_long via fieldError.
 */
export function AdminClientNoteCreate({
  organizationId,
  translations,
}: AdminClientNoteCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmedLength = body.trim().length;
  const tooLong = body.length > NOTE_MAX;
  const canSave = trimmedLength >= NOTE_MIN && !tooLong && !isPending;

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await createNote({ organizationId, body });
      if (!res.ok) {
        if (res.fieldError?.code === "body_too_short")
          setError(translations.errorTooShort);
        else if (res.fieldError?.code === "body_too_long")
          setError(translations.errorTooLong);
        else setError(translations.errorGeneric);
        return;
      }
      setBody("");
      setIsOpen(false);
    });
  };

  const onCancel = () => {
    setBody("");
    setError(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 dark:border-primary/40 dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/25"
      >
        {translations.addLabel}
      </button>
    );
  }

  const counterLabel = translations.charCounter
    .replace("{n}", String(body.length))
    .replace("{max}", String(NOTE_MAX));

  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={translations.placeholder}
        rows={5}
        autoFocus
        className="block w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-950 dark:text-white"
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
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {translations.cancel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium text-white",
              canSave
                ? "bg-primary hover:bg-primary/90"
                : "cursor-not-allowed bg-primary/40 dark:bg-primary/25"
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
