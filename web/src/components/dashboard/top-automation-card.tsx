interface TopAutomationCardProps {
  automationName: string;
  executionCount: number;
  statusLabel: string;
  translations: {
    title: string;
    executions: string;
    status: string;
  };
}

export function TopAutomationCard({
  automationName,
  executionCount,
  statusLabel,
  translations,
}: TopAutomationCardProps) {
  if (!automationName) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 min-h-[140px] flex flex-col justify-between text-white">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          {translations.title}
        </p>
        <p className="text-xl font-bold mt-1 leading-snug line-clamp-2">
          {automationName}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-4 flex-wrap">
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
          <span className="font-bold">{executionCount}</span>
          <span>{translations.executions}</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
          <span className="text-white/70">{translations.status}:</span>
          <span>{statusLabel}</span>
        </span>
      </div>
    </div>
  );
}
