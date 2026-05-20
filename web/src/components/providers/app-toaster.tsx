"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

/**
 * App-wide toast surface, mounted once in the root layout.
 *
 * Reads the resolved theme from next-themes so toasts match the active palette
 * (sonner reads its own `theme` prop, not the `data-theme` attribute). Defaults
 * to "system" until next-themes hydrates.
 *
 * Use via `import { toast } from "sonner"` anywhere in client components.
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme === "dark" ? "dark" : "light") as
    | "light"
    | "dark";

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      duration={5000}
    />
  );
}
