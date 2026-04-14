import { CheckCircle2, XCircle, Clock, Ban } from "lucide-react";

interface TimelineExecution {
  id: string;
  status: string;
  timeAgo: string;
  durationLabel: string;
  errorMessage: string | null;
}

interface ExecutionTimelineProps {
  executions: TimelineExecution[];
  translations: {
    title: string;
    empty: string;
    success: string;
    error: string;
  };
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    case "running":
      return <Clock className="w-4 h-4 text-gray-400 shrink-0" />;
    case "cancelled":
      return <Ban className="w-4 h-4 text-gray-400 shrink-0" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400 shrink-0" />;
  }
}

function dotColor(status: string): string {
  switch (status) {
    case "success":
      return "bg-green-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export function ExecutionTimeline({
  executions,
  translations,
}: ExecutionTimelineProps) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
        {translations.title}
      </h3>
      {executions.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-400 dark:text-gray-500">
          {translations.empty}
        </div>
      ) : (
        <div className="relative max-h-[400px] overflow-y-auto">
          {/* Vertical timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200 dark:bg-gray-700" />

          <ul className="space-y-4 pl-6">
            {executions.map((exec) => (
              <li key={exec.id} className="relative flex flex-col gap-0.5">
                {/* Dot on the timeline line */}
                <span
                  className={`absolute -left-[19px] top-1 w-2 h-2 rounded-full ${dotColor(exec.status)} ring-2 ring-white dark:ring-gray-800`}
                />

                {/* Status row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={exec.status} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                      {exec.status === "success"
                        ? translations.success
                        : exec.status === "error"
                          ? translations.error
                          : exec.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {exec.timeAgo}
                  </span>
                </div>

                {/* Duration row */}
                <span className="text-xs text-gray-400 dark:text-gray-500 pl-[22px]">
                  {exec.durationLabel}
                </span>

                {/* Error message */}
                {exec.errorMessage && (
                  <p className="text-xs text-red-500 truncate pl-[22px]">
                    {exec.errorMessage}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
