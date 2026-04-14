"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface AutomationsFilterTabsProps {
  counts: {
    all: number;
    active: number;
    in_setup: number;
    paused: number;
  };
  translations: {
    all: string;
    active: string;
    in_setup: string;
    paused: string;
  };
}

type FilterStatus = "all" | "active" | "in_setup" | "paused";

const TABS: { key: FilterStatus; href: string }[] = [
  { key: "all", href: "/dashboard/automations" },
  { key: "active", href: "/dashboard/automations?status=active" },
  { key: "in_setup", href: "/dashboard/automations?status=in_setup" },
  { key: "paused", href: "/dashboard/automations?status=paused" },
];

export function AutomationsFilterTabs({
  counts,
  translations,
}: AutomationsFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = (searchParams.get("status") ?? "all") as FilterStatus;

  return (
    <div
      className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-4"
      role="tablist"
      aria-label="Filter automations by status"
    >
      {TABS.map((tab) => {
        const isActive = currentStatus === tab.key;
        const count = counts[tab.key];
        const label = translations[tab.key];

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => router.push(tab.href)}
            className={cn(
              "shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              isActive
                ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium",
                isActive
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
