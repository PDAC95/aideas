"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type AdminClientTab =
  | "automations"
  | "requests"
  | "members"
  | "notes";

export const ADMIN_CLIENT_TABS: readonly AdminClientTab[] = [
  "automations",
  "requests",
  "members",
  "notes",
] as const;

interface AdminClientTabsProps {
  active: AdminClientTab;
  counts: {
    automations: number;
    requests: number;
    members: number;
    notes: number;
  };
  translations: {
    automations: string; // raw "Automations ({count})"
    requests: string;
    members: string;
    notes: string;
  };
}

/**
 * Tab strip for /admin/clients/[id]. Owns the `?tab=` URL state.
 *
 * The default tab (automations) drops the param so a refresh on the default
 * stays bare and shareable URLs are minimal. Pattern matches Phase 20
 * AdminAutomationsTabs.
 */
export function AdminClientTabs({
  active,
  counts,
  translations,
}: AdminClientTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const labelFor = (tab: AdminClientTab) =>
    translations[tab].replace("{count}", String(counts[tab]));

  const onClick = (tab: AdminClientTab) => {
    if (tab === active) return;
    const next = new URLSearchParams(params.toString());
    if (tab === "automations") {
      // canonical default — drop the param
      next.delete("tab");
    } else {
      next.set("tab", tab);
    }
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Client sections"
      className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
    >
      {ADMIN_CLIENT_TABS.map((tab) => {
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
