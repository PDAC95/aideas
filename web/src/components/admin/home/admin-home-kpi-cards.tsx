import Link from "next/link";
import { Inbox, Wrench, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminHomeKpis } from "@/lib/admin/types";

interface AdminHomeKpiCardsProps {
  kpis: AdminHomeKpis;
  labels: {
    pendingRequests: string;
    inSetupAutomations: string;
    activeClients: string;
    signupsThisWeek: string;
  };
}

interface CardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}

function KpiCard({ href, icon, iconBg, value, label }: CardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "p-6 hover:shadow-md transition-all hover:scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
            iconBg
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold text-gray-900 dark:text-white truncate">
            {new Intl.NumberFormat().format(value)}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{label}</p>
        </div>
      </div>
    </Link>
  );
}

export function AdminHomeKpiCards({ kpis, labels }: AdminHomeKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      <KpiCard
        href="/admin/requests?status=pending"
        icon={<Inbox className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
        iconBg="bg-gray-100 dark:bg-gray-700"
        value={kpis.pendingRequests}
        label={labels.pendingRequests}
      />
      <KpiCard
        href="/admin/automations?status=in_setup"
        icon={<Wrench className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
        iconBg="bg-gray-100 dark:bg-gray-700"
        value={kpis.inSetupAutomations}
        label={labels.inSetupAutomations}
      />
      <KpiCard
        href="/admin/clients"
        icon={<Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
        iconBg="bg-gray-100 dark:bg-gray-700"
        value={kpis.activeClients}
        label={labels.activeClients}
      />
      <KpiCard
        href="/admin/clients"
        icon={<UserPlus className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
        iconBg="bg-gray-100 dark:bg-gray-700"
        value={kpis.signupsThisWeek}
        label={labels.signupsThisWeek}
      />
    </div>
  );
}
