interface AutomationKpiCardsProps {
  metricCount: number | string; // number or "---" for in_setup
  metricLabel: string;          // e.g., "emails sent"
  hoursSaved: number | string;  // number or "---"
  hoursSavedLabel: string;
  monthlyCharge: string;        // formatted price string e.g., "$99/mo" or "---"
  monthlyChargeLabel: string;
}

export function AutomationKpiCards({
  metricCount,
  metricLabel,
  hoursSaved,
  hoursSavedLabel,
  monthlyCharge,
  monthlyChargeLabel,
}: AutomationKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: Monthly metric count */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof metricCount === "number" ? metricCount.toLocaleString() : metricCount}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{metricLabel}</p>
      </div>

      {/* Card 2: Hours saved */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof hoursSaved === "number"
            ? hoursSaved.toFixed(1)
            : hoursSaved}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{hoursSavedLabel}</p>
      </div>

      {/* Card 3: Monthly charge */}
      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthlyCharge}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{monthlyChargeLabel}</p>
      </div>
    </div>
  );
}
