import Link from "next/link";
import { ChevronRight, Inbox, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminHomeQuickLinksProps {
  pendingRequestsBadge: number;
  inSetupAutomationsBadge: number;
  labels: {
    requestsTitle: string;
    requestsBody: string;
    automationsTitle: string;
    automationsBody: string;
  };
}

interface QuickCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  badgeCount: number;
  badgeColor: string;
}

function QuickCard({
  href,
  icon,
  title,
  body,
  badgeCount,
  badgeColor,
}: QuickCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "p-6 hover:shadow-md transition-all"
      )}
    >
      <div className="flex items-center gap-5">
        <div className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0 bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            {badgeCount > 0 && (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  badgeColor
                )}
              >
                {new Intl.NumberFormat().format(badgeCount)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">{body}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  );
}

export function AdminHomeQuickLinks({
  pendingRequestsBadge,
  inSetupAutomationsBadge,
  labels,
}: AdminHomeQuickLinksProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      <QuickCard
        href="/admin/requests?status=pending"
        icon={
          <Inbox className="h-7 w-7 text-orange-600 dark:text-orange-400" />
        }
        title={labels.requestsTitle}
        body={labels.requestsBody}
        badgeCount={pendingRequestsBadge}
        badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      />
      <QuickCard
        href="/admin/automations?status=in_setup"
        icon={<Wrench className="h-7 w-7 text-blue-600 dark:text-blue-400" />}
        title={labels.automationsTitle}
        body={labels.automationsBody}
        badgeCount={inSetupAutomationsBadge}
        badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      />
    </div>
  );
}
