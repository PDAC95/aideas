"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  AdminRequestStatus,
  AdminRequestStatusCounts,
} from "@/lib/admin/types";

interface AdminRequestsTabsProps {
  active: AdminRequestStatus;
  counts: AdminRequestStatusCounts;
  translations: {
    pending: string; // raw "Pending ({count})"
    approved: string;
    rejected: string;
  };
}

const STATUSES: AdminRequestStatus[] = ["pending", "approved", "rejected"];

/**
 * Status tabs for /admin/requests. Owns URL state for the active tab via the
 * `?status=` query parameter. The default tab (pending) drops the param so
 * a refresh on Pending stays bare and shareable URLs are minimal.
 *
 * Uses startTransition so the active state updates immediately while the
 * server re-renders the underlying table.
 */
export function AdminRequestsTabs({
  active,
  counts,
  translations,
}: AdminRequestsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const labelFor = (status: AdminRequestStatus) =>
    translations[status].replace("{count}", String(counts[status]));

  const onClick = (status: AdminRequestStatus) => {
    if (status === active) return;
    const next = new URLSearchParams(params.toString());
    if (status === "pending") {
      // canonical default: drop the param so refresh stays on Pending
      next.delete("status");
    } else {
      next.set("status", status);
    }
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Request status"
      className="flex gap-1 border-b border-gray-200 dark:border-gray-700"
    >
      {STATUSES.map((status) => {
        const isActive = status === active;
        return (
          <button
            key={status}
            role="tab"
            aria-selected={isActive}
            type="button"
            disabled={isPending}
            onClick={() => onClick(status)}
            className={cn(
              "relative -mb-px px-4 py-2 text-sm font-medium transition-colors",
              "border-b-2",
              isActive
                ? "border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
              isPending && "opacity-60 cursor-wait"
            )}
          >
            {labelFor(status)}
          </button>
        );
      })}
    </div>
  );
}
