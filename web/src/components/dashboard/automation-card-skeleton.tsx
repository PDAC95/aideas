export function AutomationCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-5 animate-pulse">
      {/* Top row: name + badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
      </div>

      {/* Category */}
      <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-700 rounded mt-1 mb-2" />

      {/* App circles */}
      <div className="flex items-center gap-1 mb-3 mt-2">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Bottom row: metric + price */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <div className="h-3 w-2/5 bg-gray-100 dark:bg-gray-700 rounded" />
        <div className="h-3 w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
