"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  AdminAutomationTab,
  AdminAutomationStatusCounts,
} from "@/lib/admin/types";
import { ADMIN_AUTOMATION_TABS } from "@/lib/admin/types";

interface AdminAutomationsTabsProps {
  active: AdminAutomationTab;
  counts: AdminAutomationStatusCounts;
  translations: {
    active: string; // raw "Active ({count})"
    in_setup: string; // raw "In setup ({count})"
    paused: string; // raw "Paused ({count})"
    failed: string; // raw "Failed ({count})"
    archived: string; // raw "Archived ({count})"
    other: string; // raw "Other ({count})" — only rendered when counts.other > 0
  };
}

/**
 * Status tabs for /admin/automations. Owns URL state for the active tab via
 * the `?status=` query parameter. The default tab (active) drops the param so
 * a refresh on Active stays bare and shareable URLs are minimal.
 *
 * Uses startTransition so the active state updates immediately while the
 * server re-renders the underlying table.
 */
export function AdminAutomationsTabs({
  active,
  counts,
  translations,
}: AdminAutomationsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const labelFor = (tab: AdminAutomationTab) =>
    translations[tab].replace("{count}", String(counts[tab]));

  const onClick = (tab: AdminAutomationTab) => {
    if (tab === active) return;
    const next = new URLSearchParams(params.toString());
    if (tab === "active") {
      // canonical default — drop the param
      next.delete("status");
    } else {
      next.set("status", tab);
    }
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Automation status"
      className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
    >
      {ADMIN_AUTOMATION_TABS.map((tab) => {
        // The "other" tab is a catch-all for draft + pending_review and is rendered
        // ONLY when there is at least one row in either of those two states. When
        // counts.other === 0 the tab strip cleanly shows the original 5 tabs.
        if (tab === "other" && counts.other === 0) return null;

        const isActive = tab === active;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            type="button"
            disabled={isPending}
            onClick={() => onClick(tab)}
            className={cn(
              "relative -mb-px whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
              "border-b-2",
              isActive
                ? "border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
              isPending && "opacity-60 cursor-wait"
            )}
          >
            {labelFor(tab)}
          </button>
        );
      })}
    </div>
  );
}
