"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activateAutomation,
  pauseAutomation,
  resumeAutomation,
} from "@/lib/actions/admin-automations";
import { ArchiveAutomationModal } from "./archive-automation-modal";

interface AutomationTransitionButtonsProps {
  automationId: string;
  currentStatus: "in_setup" | "active" | "paused";
  translations: {
    activate: string;
    activating: string;
    pause: string;
    pausing: string;
    resume: string;
    resuming: string;
    archive: string;
    errorStateChanged: string;
    errorGeneric: string;
    archiveModal: {
      title: string;
      body: string;
      cancel: string;
      confirm: string;
      confirming: string;
      errorStateChanged: string;
      errorGeneric: string;
    };
  };
}

export function AutomationTransitionButtons({
  automationId,
  currentStatus,
  translations,
}: AutomationTransitionButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runTransition = (
    action:
      | typeof activateAutomation
      | typeof pauseAutomation
      | typeof resumeAutomation,
    expectedStatus: "in_setup" | "active" | "paused"
  ) => {
    startTransition(async () => {
      const result = await action({ automationId, expectedStatus });
      if (!result.ok) {
        if (result.error === "state_changed") {
          alert(translations.errorStateChanged);
          router.refresh();
          return;
        }
        alert(translations.errorGeneric);
        console.error("[AutomationTransitionButtons] failed", result.error);
        return;
      }
      router.refresh();
    });
  };

  // in_setup -> only Activate
  if (currentStatus === "in_setup") {
    return (
      <button
        type="button"
        onClick={() => runTransition(activateAutomation, "in_setup")}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? translations.activating : translations.activate}
      </button>
    );
  }

  // active -> Pause (primary) + Archive (destructive)
  if (currentStatus === "active") {
    return (
      <>
        <button
          type="button"
          onClick={() => runTransition(pauseAutomation, "active")}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? translations.pausing : translations.pause}
        </button>
        <ArchiveAutomationModal
          automationId={automationId}
          expectedStatus="active"
          translations={{
            triggerLabel: translations.archive,
            ...translations.archiveModal,
          }}
        />
      </>
    );
  }

  // paused -> Resume (primary) + Archive (destructive)
  if (currentStatus === "paused") {
    return (
      <>
        <button
          type="button"
          onClick={() => runTransition(resumeAutomation, "paused")}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? translations.resuming : translations.resume}
        </button>
        <ArchiveAutomationModal
          automationId={automationId}
          expectedStatus="paused"
          translations={{
            triggerLabel: translations.archive,
            ...translations.archiveModal,
          }}
        />
      </>
    );
  }

  // Other statuses (archived/draft/pending_review/failed) -> render nothing.
  return null;
}
