interface AutomationSuccessRateProps {
  rate: number;
  translations: {
    title: string;
  };
}

export function AutomationSuccessRate({
  rate,
  translations,
}: AutomationSuccessRateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
      <p className="text-base font-semibold text-gray-900 dark:text-white">
        {translations.title}
      </p>

      <div className="flex flex-col items-center justify-center flex-1 py-4">
        <p className="text-4xl font-bold text-purple-400 dark:text-purple-300">
          {rate === 0 ? "—" : `${rate}%`}
        </p>
      </div>
    </div>
  );
}
