"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminClientsPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  translations: {
    label: string; // "{from}-{to} of {total}"
    previous: string;
    next: string;
    page: string; // "Page {page} of {total}"
  };
}

export function AdminClientsPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  translations,
}: AdminClientsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const goto = (target: number) => {
    const sp = new URLSearchParams(params.toString());
    if (target <= 1) sp.delete("page");
    else sp.set("page", String(target));
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);

  const rangeLabel = translations.label
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(totalCount));
  const pageLabel = translations.page
    .replace("{page}", String(page))
    .replace("{total}", String(totalPages));

  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rangeLabel}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending || page <= 1}
          onClick={() => goto(page - 1)}
          className={cn(
            "rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700",
            page <= 1
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          {translations.previous}
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {pageLabel}
        </span>
        <button
          type="button"
          disabled={isPending || page >= totalPages}
          onClick={() => goto(page + 1)}
          className={cn(
            "rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700",
            page >= totalPages
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          )}
        >
          {translations.next}
        </button>
      </div>
    </div>
  );
}
