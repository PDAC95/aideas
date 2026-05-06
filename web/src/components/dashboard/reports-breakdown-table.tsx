"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { AutomationBreakdownRow } from "@/lib/dashboard/types";

interface ReportsBreakdownTableProps {
  rows: AutomationBreakdownRow[];
  translations: {
    title: string;
    automationName: string;
    metricLabel: string;
    count: string;
    hoursSaved: string;
    total: string;
    viewAll: string;
    showLess: string;
  };
}

type SortKey = "name" | "count" | "hoursSaved";
type SortDir = "asc" | "desc";

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  currentSortDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}

function SortHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDir,
  onSort,
  className,
}: SortHeaderProps) {
  const isActive = currentSortKey === sortKey;
  const Icon = isActive && currentSortDir === "asc" ? ChevronUp : ChevronDown;

  return (
    <th
      className={`py-3 px-2 text-left text-gray-500 dark:text-gray-400 font-medium cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${className ?? ""}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <Icon
          className={`h-3.5 w-3.5 ${isActive ? "opacity-100" : "opacity-30"}`}
        />
      </div>
    </th>
  );
}

const PAGE_SIZE = 10;

export function ReportsBreakdownTable({
  rows,
  translations,
}: ReportsBreakdownTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("hoursSaved");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAll, setShowAll] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortKey === "count") {
        cmp = a.count - b.count;
      } else {
        cmp = a.hoursSaved - b.hoursSaved;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortKey, sortDir]);

  const displayedRows = showAll ? sortedRows : sortedRows.slice(0, PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE;

  const totalCount = rows.reduce((sum, r) => sum + r.count, 0);
  const totalHours = rows.reduce((sum, r) => sum + r.hoursSaved, 0);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-4">
        {translations.title}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <SortHeader
                label={translations.automationName}
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDir={sortDir}
                onSort={handleSort}
              />
              <th className="py-3 px-2 text-left text-gray-500 dark:text-gray-400 font-medium">
                {translations.metricLabel}
              </th>
              <SortHeader
                label={translations.count}
                sortKey="count"
                currentSortKey={sortKey}
                currentSortDir={sortDir}
                onSort={handleSort}
                className="text-right"
              />
              <SortHeader
                label={translations.hoursSaved}
                sortKey="hoursSaved"
                currentSortKey={sortKey}
                currentSortDir={sortDir}
                onSort={handleSort}
                className="text-right"
              />
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr
                key={row.automationId}
                className="border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">
                  {row.name}
                </td>
                <td className="py-3 px-2 text-gray-500 dark:text-gray-400">
                  {row.metricLabel}
                </td>
                <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                  {new Intl.NumberFormat().format(row.count)}
                </td>
                <td className="py-3 px-2 text-right text-gray-900 dark:text-white">
                  {row.hoursSaved.toFixed(1)}
                </td>
              </tr>
            ))}

            {/* Totals row */}
            <tr className="border-t-2 border-gray-200 dark:border-gray-600">
              <td
                className="py-3 px-2 font-bold text-gray-900 dark:text-white"
                colSpan={2}
              >
                {translations.total}
              </td>
              <td className="py-3 px-2 text-right font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat().format(totalCount)}
              </td>
              <td className="py-3 px-2 text-right font-bold text-gray-900 dark:text-white">
                {totalHours.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            {showAll
              ? translations.showLess
              : `${translations.viewAll} (${rows.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
