import Link from "next/link";
import { Inbox, Zap, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/time";
import type {
  AdminHomeActivityEntry,
  AdminHomeActivityEventType,
} from "@/lib/admin/types";

/**
 * Translation dict for the activity feed. The page builds this from
 * getTranslations("admin.home") + getTranslations("common") and passes it as
 * a plain prop so this stays a pure render (no `useTranslations` import,
 * works in server context).
 *
 * `events.*` keys are ICU-style templates with substitution placeholders:
 *   - request_created     : "{orgName} requested {requestTitle}"
 *   - automation_activated: "{orgName} activated {automationName}"
 *   - new_signup          : "{orgName} signed up"
 *
 * `time` is the next-intl `t` function bound to the "common" namespace —
 * formatRelativeTime calls it with keys like "timeAgo.now", "timeAgo.minutes".
 */
interface AdminHomeActivityFeedProps {
  entries: AdminHomeActivityEntry[];
  translations: {
    title: string;
    empty: string;
    events: {
      request_created: string;
      automation_activated: string;
      new_signup: string;
    };
  };
  time: (key: string) => string;
}

const iconByType: Record<
  AdminHomeActivityEventType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bg: string;
    color: string;
  }
> = {
  request_created: {
    icon: Inbox,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    color: "text-orange-600 dark:text-orange-400",
  },
  automation_activated: {
    icon: Zap,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  new_signup: {
    icon: UserPlus,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
};

function renderEventText(
  entry: AdminHomeActivityEntry,
  templates: AdminHomeActivityFeedProps["translations"]["events"]
): string {
  const template = templates[entry.type];
  return template
    .replace("{orgName}", entry.orgName)
    .replace("{requestTitle}", entry.requestTitle ?? "")
    .replace("{automationName}", entry.automationName ?? "");
}

export function AdminHomeActivityFeed({
  entries,
  translations,
  time,
}: AdminHomeActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {translations.title}
        </h2>
      </div>
      {entries.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          {translations.empty}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {entries.map((entry) => {
            const config = iconByType[entry.type];
            const Icon = config.icon;
            return (
              <li key={`${entry.type}-${entry.entityId}`}>
                <Link
                  href={entry.href}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5",
                      config.bg
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {renderEventText(entry, translations.events)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                    {formatRelativeTime(entry.occurredAt, time)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
