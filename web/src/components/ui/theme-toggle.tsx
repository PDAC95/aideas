"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  label: string;
  className?: string;
}

// useSyncExternalStore with noop subscribe + null server snapshot is the React
// idiomatic way to read "are we hydrated yet?" without setState-in-effect.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsHydrated() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function ThemeToggle({ label, className }: ThemeToggleProps) {
  const hydrated = useIsHydrated();
  const { resolvedTheme, setTheme } = useTheme();

  // Reserve the exact slot before hydration so the header layout doesn't shift
  // when next-themes resolves the active theme (FOUC mitigation).
  if (!hydrated) {
    return (
      <button
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card opacity-0",
          className
        )}
        disabled
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
