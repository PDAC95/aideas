"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveRequest } from "@/lib/actions/admin-requests";

interface ApproveRequestButtonProps {
  requestId: string;
  translations: {
    approve: string;
    approving: string;
    errorStateChanged: string;
    errorGeneric: string;
  };
}

export function ApproveRequestButton({
  requestId,
  translations,
}: ApproveRequestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      const result = await approveRequest({ requestId });
      if (!result.ok) {
        if (result.error === "state_changed") {
          alert(translations.errorStateChanged);
          router.refresh();
          return;
        }
        alert(translations.errorGeneric);
        console.error("[ApproveRequestButton] failed", result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? translations.approving : translations.approve}
    </button>
  );
}
