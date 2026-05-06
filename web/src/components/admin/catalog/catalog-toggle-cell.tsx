"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleTemplateActive, toggleTemplateFeatured } from "@/lib/actions/admin-catalog";

export interface CatalogToggleCellTranslations {
  activeOn: string;
  activeOff: string;
  featuredOn: string;
  featuredOff: string;
  errorRevert: string;
  deactivateModal: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
}

interface CatalogToggleCellProps {
  field: "active" | "featured";
  templateId: string;
  initial: boolean;
  hasActiveAutomations?: boolean;
  activeAutomationsCount?: number;
  translations: CatalogToggleCellTranslations;
}

/**
 * Single inline switch driving is_active or is_featured for one template.
 *
 * Behavior:
 * - Optimistic flip immediately on click.
 * - On server-action failure, revert local state and show inline error text.
 * - When deactivating an `active` toggle on a template with live automations,
 *   open a confirm modal first; Cancel reverts, Confirm proceeds.
 */
export function CatalogToggleCell({
  field,
  templateId,
  initial,
  hasActiveAutomations = false,
  activeAutomationsCount = 0,
  translations,
}: CatalogToggleCellProps) {
  const [checked, setChecked] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const labelOn = field === "active" ? translations.activeOn : translations.featuredOn;
  const labelOff = field === "active" ? translations.activeOff : translations.featuredOff;

  const performToggle = (nextValue: boolean) => {
    setChecked(nextValue);
    setError(null);
    startTransition(async () => {
      const result =
        field === "active"
          ? await toggleTemplateActive({ templateId, nextActive: nextValue })
          : await toggleTemplateFeatured({ templateId, nextFeatured: nextValue });

      if (!result.ok) {
        // Revert
        setChecked(!nextValue);
        setError(translations.errorRevert);
        console.error(`[CatalogToggleCell] ${field} update failed`, result.error);
      }
    });
  };

  const handleClick = () => {
    const nextValue = !checked;

    // Deactivation gate: warn if turning Active OFF on a template with live automations.
    if (
      field === "active" &&
      checked === true &&
      nextValue === false &&
      hasActiveAutomations
    ) {
      setModalOpen(true);
      return;
    }

    performToggle(nextValue);
  };

  const handleModalConfirm = () => {
    setModalOpen(false);
    performToggle(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={handleClick}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1",
            checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
        <span
          className={cn(
            "text-xs font-medium",
            checked ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
          )}
        >
          {checked ? labelOn : labelOff}
        </span>
        {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleModalCancel}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {translations.deactivateModal.title}
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
              {translations.deactivateModal.body.replace(
                "{count}",
                String(activeAutomationsCount)
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleModalCancel}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {translations.deactivateModal.cancel}
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {translations.deactivateModal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
