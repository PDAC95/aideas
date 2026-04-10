interface PerformanceMetric {
  label: string;
  value: string;
}

interface AutomationPerformanceProps {
  metrics: PerformanceMetric[];
  translations: {
    title: string;
  };
}

export function AutomationPerformance({
  metrics,
  translations,
}: AutomationPerformanceProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">
        {translations.title}
      </p>

      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {metrics.map((metric) => (
          <li key={metric.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
