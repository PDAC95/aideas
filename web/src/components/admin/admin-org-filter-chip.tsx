import Link from "next/link";
import { X } from "lucide-react";
import type { AdminOrgFilterMeta } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/**
 * Admin org filter chip — server component.
 *
 * Rendered above /admin/requests and /admin/automations tables when the URL
 * carries a `?org=<slug-or-uuid>` parameter. Two visual variants:
 *
 *  - "active" (purple/neutral palette): `?org=` resolved to a live org.
 *    Renders the org name plus a `<Link>` ✕ that drops only `?org=` while
 *    preserving every other search param.
 *  - "error" (destructive red palette): `?org=` was provided but did not
 *    resolve. Renders a pre-interpolated "Organization not found: <value>"
 *    message plus the same ✕ clear affordance.
 *
 * When no `?org=` was provided the component returns `null`, so pages can
 * render it unconditionally without an outer guard.
 *
 * Layout: inline-flex pill matching the Phase 20 filter-bar visual rhythm.
 */
interface AdminOrgFilterChipProps {
  orgFilter: AdminOrgFilterMeta;
  currentSearchParams: Record<string, string | undefined>;
  basePath: "/admin/requests" | "/admin/automations";
  translations: {
    label: string;
    clear: string;
    notFound: string;
  };
}

export function AdminOrgFilterChip({
  orgFilter,
  currentSearchParams,
  basePath,
  translations,
}: AdminOrgFilterChipProps) {
  if (orgFilter.orgIdentifierProvided === null) {
    return null;
  }

  // Build the "clear" href: keep every other param, drop only `org`.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(currentSearchParams)) {
    if (key === "org") continue;
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  const clearHref = qs.length === 0 ? basePath : `${basePath}?${qs}`;

  const isResolved = orgFilter.resolvedOrg !== null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        isResolved
          ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary"
          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
      )}
    >
      {isResolved && orgFilter.resolvedOrg ? (
        <span>
          {translations.label}{" "}
          <strong className="font-semibold">
            {orgFilter.resolvedOrg.name}
          </strong>
        </span>
      ) : (
        <span>{translations.notFound}</span>
      )}
      <Link
        href={clearHref}
        aria-label={translations.clear}
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors",
          isResolved
            ? "hover:bg-primary/15 dark:hover:bg-primary/25"
            : "hover:bg-red-200 dark:hover:bg-red-800/60"
        )}
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
