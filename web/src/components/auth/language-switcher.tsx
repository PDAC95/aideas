"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={cn(
        "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
      aria-label="Switch language"
    >
      <span className={cn(locale === "es" ? "font-bold text-foreground" : "")}>
        ES
      </span>
      <span className="mx-1 opacity-40">|</span>
      <span className={cn(locale === "en" ? "font-bold text-foreground" : "")}>
        EN
      </span>
    </button>
  );
}
