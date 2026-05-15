"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface AdminClientsSearchProps {
  initialQuery: string;
  translations: {
    label: string;
    placeholder: string;
    clear: string;
  };
}

const DEBOUNCE_MS = 300;

export function AdminClientsSearch({
  initialQuery,
  translations,
}: AdminClientsSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Honor external URL changes (e.g., back/forward navigation) without
  // useEffect-based setState (would trip react-hooks/set-state-in-effect).
  // Pattern: store last-synced URL signature; if the URL has a different q
  // than what we last pushed, accept it.
  const urlQ = params.get("q") ?? "";
  const [lastSyncedQ, setLastSyncedQ] = useState(initialQuery);
  if (urlQ !== lastSyncedQ && urlQ !== value) {
    setLastSyncedQ(urlQ);
    setValue(urlQ);
  }

  const push = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    if (next.length === 0) {
      sp.delete("q");
    } else {
      sp.set("q", next);
    }
    sp.delete("page"); // resetting search resets pagination
    const qs = sp.toString();
    setLastSyncedQ(next);
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onChange = (raw: string) => {
    setValue(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(raw.trim()), DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="max-w-md">
      <label
        htmlFor="admin-clients-search"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {translations.label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id="admin-clients-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={translations.placeholder}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {translations.clear}
          </button>
        )}
      </div>
    </div>
  );
}
