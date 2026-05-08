"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveAutomation } from "@/lib/actions/admin-automations";

interface ArchiveAutomationModalProps {
  automationId: string;
  expectedStatus: "active" | "paused";
  translations: {
    triggerLabel: string;
    title: string;
    body: string;
    cancel: string;
    confirm: string;
    confirming: string;
    errorStateChanged: string;
    errorGeneric: string;
  };
}

export function ArchiveAutomationModal({
  automationId,
  expectedStatus,
  translations,
}: ArchiveAutomationModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isPending) return;
    setOpen(false);
    setError(null);
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveAutomation({
        automationId,
        expectedStatus,
      });
      if (!result.ok) {
        if (result.error === "state_changed") {
          setError(translations.errorStateChanged);
          router.refresh();
          return;
        }
        setError(translations.errorGeneric);
        console.error("[ArchiveAutomationModal] failed", result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {translations.triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {translations.title}
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {translations.body}
            </p>

            {error && (
              <p className="mb-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
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
                onClick={handleConfirm}
                disabled={isPending}
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
