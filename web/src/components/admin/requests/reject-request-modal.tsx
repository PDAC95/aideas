"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rejectRequest } from "@/lib/actions/admin-requests";
import {
  REJECT_REASON_MIN,
  REJECT_REASON_MAX,
} from "@/lib/validations/admin-request";

interface RejectRequestModalProps {
  requestId: string;
  translations: {
    triggerLabel: string;
    title: string;
    body: string;
    placeholder: string;
    cancel: string;
    confirm: string;
    confirming: string;
    errorTooShort: string;
    errorTooLong: string;
    errorStateChanged: string;
    errorGeneric: string;
    charCounter: string; // template "{count}/{max}"
  };
}

export function RejectRequestModal({
  requestId,
  translations,
}: RejectRequestModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmed = reason.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < REJECT_REASON_MIN;
  const tooLong = trimmed.length > REJECT_REASON_MAX;
  const canSubmit =
    trimmed.length >= REJECT_REASON_MIN &&
    trimmed.length <= REJECT_REASON_MAX &&
    !isPending;

  const charCounter = translations.charCounter
    .replace("{count}", String(trimmed.length))
    .replace("{max}", String(REJECT_REASON_MAX));

  const reset = () => {
    setReason("");
    setError(null);
  };

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
    reset();
  };

  const handleSubmit = () => {
    setError(null);
    if (!canSubmit) {
      if (tooShort) setError(translations.errorTooShort);
      else if (tooLong) setError(translations.errorTooLong);
      return;
    }
    startTransition(async () => {
      const result = await rejectRequest({ requestId, reason });
      if (!result.ok) {
        if (result.error === "state_changed") {
          setError(translations.errorStateChanged);
          router.refresh();
          return;
        }
        if (result.error === "invalid_input") {
          if (result.fieldError === "reason_too_short") {
            setError(translations.errorTooShort);
            return;
          }
          if (result.fieldError === "reason_too_long") {
            setError(translations.errorTooLong);
            return;
          }
        }
        setError(translations.errorGeneric);
        console.error("[RejectRequestModal] failed", result.error);
        return;
      }
      // Success — close + refresh
      setOpen(false);
      reset();
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-900/20 transition-colors"
      >
        {translations.triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {translations.title}
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {translations.body}
            </p>

            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder={translations.placeholder}
              maxLength={REJECT_REASON_MAX}
              rows={5}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span
                className={
                  error ? "text-red-600 dark:text-red-400" : "text-transparent"
                }
              >
                {error || "."}
              </span>
              <span
                className={`tabular-nums ${
                  tooLong
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {charCounter}
              </span>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {translations.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? translations.confirming : translations.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
