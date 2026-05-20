"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchLocale } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

interface AdminLocaleSwitcherProps {
  initialLocale: "en" | "es";
  ariaLabel: string;
}

/**
 * Admin-shell locale switcher — minimalist EN | ES toggle.
 *
 * Renders as two flat buttons separated by a divider, no dropdown, matching
 * the Factory aesthetic of AdminHeader (sober, no shadows). Persists the
 * choice via the `switchLocale` server action (cookie) and refreshes the
 * server tree so next-intl re-resolves messages.
 */
export function AdminLocaleSwitcher({
  initialLocale,
  ariaLabel,
}: AdminLocaleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function selectLocale(next: "en" | "es") {
    if (next === initialLocale || isPending) return;
    startTransition(async () => {
      await switchLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex h-9 items-center rounded-sm border border-border bg-card text-xs font-semibold tracking-wider"
    >
      <button
        type="button"
        onClick={() => selectLocale("en")}
        disabled={isPending}
        aria-pressed={initialLocale === "en"}
        className={cn(
          "px-3 h-full transition-colors disabled:opacity-50",
          initialLocale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <span aria-hidden className="h-4 w-px bg-border" />
      <button
        type="button"
        onClick={() => selectLocale("es")}
        disabled={isPending}
        aria-pressed={initialLocale === "es"}
        className={cn(
          "px-3 h-full transition-colors disabled:opacity-50",
          initialLocale === "es"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
    </div>
  );
}
