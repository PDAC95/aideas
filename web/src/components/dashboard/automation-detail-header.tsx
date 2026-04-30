"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "radix-ui";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { updateAutomationStatus } from "@/app/(dashboard)/dashboard/automations/[id]/actions";

type AutomationStatus = "active" | "paused" | "failed" | "in_setup" | "pending_review" | "draft" | "archived";

interface AutomationDetailHeaderProps {
  automationId: string;
  name: string;
  status: AutomationStatus;
  category: string;
  connectedApps: string[] | null;
  statusLabel: string;
  translations: {
    pause: string;
    resume: string;
    cancel: string;
    pauseSuccess: string;
    resumeSuccess: string;
    cancelSuccess: string;
    cancelDialogTitle: string;
    cancelDialogDescription: string;
    cancelDialogBack: string;
    cancelDialogConfirm: string;
    permissionError: string;
  };
}

/** Returns a two-character abbreviation and a deterministic color for a connected app name */
function AppBadge({ name }: { name: string }) {
  const abbr = name.slice(0, 2).toUpperCase();
  // Simple hash for color selection
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
    "bg-sky-100 text-sky-700",
  ];
  const colorIndex =
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % colors.length;
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 ${colors[colorIndex]}`}
      title={name}
    >
      {abbr}
    </span>
  );
}

export function AutomationDetailHeader({
  automationId,
  name,
  status,
  category,
  connectedApps,
  statusLabel,
  translations,
}: AutomationDetailHeaderProps) {
  const router = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useState<AutomationStatus>(status);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handlePause() {
    setOptimisticStatus("paused");
    setIsPending(true);
    const result = await updateAutomationStatus(automationId, "paused");
    setIsPending(false);
    if ("error" in result) {
      setOptimisticStatus(status);
      setToast({ type: "error", message: translations.permissionError });
    } else {
      setToast({ type: "success", message: translations.pauseSuccess });
    }
  }

  async function handleResume() {
    setOptimisticStatus("active");
    setIsPending(true);
    const result = await updateAutomationStatus(automationId, "active");
    setIsPending(false);
    if ("error" in result) {
      setOptimisticStatus(status);
      setToast({ type: "error", message: translations.permissionError });
    } else {
      setToast({ type: "success", message: translations.resumeSuccess });
    }
  }

  async function handleCancelConfirm() {
    setCancelOpen(false);
    setIsPending(true);
    const result = await updateAutomationStatus(automationId, "archived");
    setIsPending(false);
    if ("error" in result) {
      setToast({ type: "error", message: translations.permissionError });
    } else {
      setToast({ type: "success", message: translations.cancelSuccess });
      setTimeout(() => router.push("/dashboard/automations"), 800);
    }
  }

  const displayApps = (connectedApps ?? []).slice(0, 2);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border bg-white dark:bg-gray-800 p-4">
      {/* Left: name, category, app badges, status */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {name}
          </h1>
          <StatusBadge status={optimisticStatus} label={statusLabel} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{category}</span>
          {displayApps.length > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-1">
                {displayApps.map((app) => (
                  <AppBadge key={app} name={app} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {optimisticStatus === "active" && (
          <>
            <button
              onClick={handlePause}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.pause}
            </button>
            <AlertDialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialog.Trigger asChild>
                <button
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {translations.cancel}
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                  <AlertDialog.Title className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {translations.cancelDialogTitle}
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-muted-foreground mb-6">
                    {translations.cancelDialogDescription}
                  </AlertDialog.Description>
                  <div className="flex justify-end gap-3">
                    <AlertDialog.Cancel asChild>
                      <button className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {translations.cancelDialogBack}
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        onClick={handleCancelConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        {translations.cancelDialogConfirm}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </>
        )}

        {optimisticStatus === "paused" && (
          <>
            <button
              onClick={handleResume}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.resume}
            </button>
            <AlertDialog.Root open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialog.Trigger asChild>
                <button
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {translations.cancel}
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                  <AlertDialog.Title className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {translations.cancelDialogTitle}
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-sm text-muted-foreground mb-6">
                    {translations.cancelDialogDescription}
                  </AlertDialog.Description>
                  <div className="flex justify-end gap-3">
                    <AlertDialog.Cancel asChild>
                      <button className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        {translations.cancelDialogBack}
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        onClick={handleCancelConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        {translations.cancelDialogConfirm}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
