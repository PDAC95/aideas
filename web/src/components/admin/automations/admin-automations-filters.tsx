"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type {
  AdminAutomationOrgOption,
  AdminAutomationTemplateOption,
} from "@/lib/admin/types";

interface AdminAutomationsFiltersProps {
  orgs: AdminAutomationOrgOption[];
  templates: AdminAutomationTemplateOption[];
  initial: {
    org: string | null;
    template: string | null;
    q: string | null;
  };
  translations: {
    orgLabel: string;
    orgAll: string;
    templateLabel: string;
    templateAll: string;
    searchPlaceholder: string;
    searchLabel: string;
  };
}

const DEBOUNCE_MS = 300;

/**
 * Three-control filter bar for /admin/automations: org dropdown, template
 * dropdown, and a debounced name search input. All three URL-sync into
 * `?org=`, `?template=`, `?q=`. Empty values DROP the key so the URL stays
 * canonical.
 *
 * The text input is debounced 300ms so we don't push a new URL on every
 * keystroke. Pressing Enter pushes immediately.
 */
export function AdminAutomationsFilters({
  orgs,
  templates,
  initial,
  translations,
}: AdminAutomationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Local mirrors so the inputs feel snappy (controlled). We sync to URL
  // changes during render via the "useState as cache" pattern (React docs:
  // "Storing information from previous renders") — when the URL signature
  // diverges from the last one we observed, we re-seed local state from the
  // URL. This avoids the cascading-renders pitfall of setState-in-useEffect.
  const urlOrg = params.get("org") ?? "";
  const urlTemplate = params.get("template") ?? "";
  const urlQuery = params.get("q") ?? "";
  const urlSig = `${urlOrg}|${urlTemplate}|${urlQuery}`;

  const [orgValue, setOrgValue] = useState(initial.org ?? "");
  const [templateValue, setTemplateValue] = useState(initial.template ?? "");
  const [queryValue, setQueryValue] = useState(initial.q ?? "");
  const [lastSyncedSig, setLastSyncedSig] = useState<string>(urlSig);

  if (urlSig !== lastSyncedSig) {
    setLastSyncedSig(urlSig);
    setOrgValue(urlOrg);
    setTemplateValue(urlTemplate);
    setQueryValue(urlQuery);
  }

  const pushUrl = (overrides: {
    org?: string;
    template?: string;
    q?: string;
  }) => {
    const next = new URLSearchParams(params.toString());
    const apply = (key: string, value: string | undefined) => {
      if (value === undefined) return;
      if (value.trim().length === 0) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    };
    apply("org", overrides.org);
    apply("template", overrides.template);
    apply("q", overrides.q);
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const onOrgChange = (value: string) => {
    setOrgValue(value);
    pushUrl({ org: value });
  };

  const onTemplateChange = (value: string) => {
    setTemplateValue(value);
    pushUrl({ template: value });
  };

  // Debounced search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onQueryChange = (value: string) => {
    setQueryValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushUrl({ q: value });
    }, DEBOUNCE_MS);
  };
  const onQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      pushUrl({ q: queryValue });
    }
  };

  const selectClass = cn(
    "h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm",
    "text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500",
    "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {translations.orgLabel}
        </label>
        <select
          value={orgValue}
          onChange={(e) => onOrgChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{translations.orgAll}</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {translations.templateLabel}
        </label>
        <select
          value={templateValue}
          onChange={(e) => onTemplateChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{translations.templateAll}</option>
          {templates.map((tmpl) => (
            <option key={tmpl.id} value={tmpl.id}>
              {tmpl.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {translations.searchLabel}
        </label>
        <input
          type="text"
          value={queryValue}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onQueryKeyDown}
          placeholder={translations.searchPlaceholder}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
