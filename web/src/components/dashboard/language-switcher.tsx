"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Loader2 } from "lucide-react";
import { switchLocale } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  initialLocale: "en" | "es";
  labels: {
    english: string;
    spanish: string;
  };
}

export function LanguageSwitcher({
  initialLocale,
  labels,
}: LanguageSwitcherProps) {
  const [locale, setLocale] = useState<"en" | "es">(initialLocale);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectLocale(next: "en" | "es") {
    setOpen(false);
    if (next === locale) return;
    setLocale(next);
    startTransition(async () => {
      await switchLocale(next);
      router.refresh();
    });
  }

  const currentLabel = locale === "en" ? "EN" : "ES";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-3 px-6 py-4.5 rounded-full",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "text-sm font-medium text-gray-900 dark:text-white shadow-sm",
          "hover:shadow transition-all disabled:opacity-50"
        )}
        aria-label="Switch language"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <span>{currentLabel}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
          <button
            onClick={() => selectLocale("en")}
            className={cn(
              "flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
              locale === "en" && "font-semibold text-purple-600 dark:text-purple-400"
            )}
          >
            <span>{labels.english}</span>
            {locale === "en" && <span className="text-xs">✓</span>}
          </button>
          <button
            onClick={() => selectLocale("es")}
            className={cn(
              "flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
              locale === "es" && "font-semibold text-purple-600 dark:text-purple-400"
            )}
          >
            <span>{labels.spanish}</span>
            {locale === "es" && <span className="text-xs">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
