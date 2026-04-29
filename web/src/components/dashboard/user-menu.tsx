"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  avatarInitial: string;
  avatarUrl?: string | null;
  displayName: string;
  translations: {
    profile: string;
    settings: string;
    signOut: string;
  };
}

export function UserMenu({
  avatarInitial,
  avatarUrl,
  displayName,
  translations,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-full",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "shadow-sm hover:shadow transition-shadow"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white text-sm font-semibold select-none overflow-hidden relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            avatarInitial
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <User className="h-4 w-4" />
            {translations.profile}
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            {translations.settings}
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {translations.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
