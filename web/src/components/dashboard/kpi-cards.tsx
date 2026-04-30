import Link from "next/link";
import { Zap, ListChecks, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/dashboard/types";

interface KpiCardsProps {
  kpis: KpiData;
  labels: {
    activeAutomations: string;
    tasksThisWeek: string;
    hoursSavedThisMonth: string;
  };
}

function formatNumber(value: number, decimals?: number): string {
  if (decimals !== undefined) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US").format(value);
}

interface KpiCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
}

function KpiCard({ href, icon, iconBg, value, label }: KpiCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700",
        "p-6 hover:shadow-md transition-all hover:scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center justify-center w-12 h-12 rounded-full shrink-0", iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{label}</p>
        </div>
      </div>
    </Link>
  );
}

export function KpiCards({ kpis, labels }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      <KpiCard
        href="/dashboard/automations"
        icon={<Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        value={formatNumber(kpis.activeAutomations)}
        label={labels.activeAutomations}
      />
      <KpiCard
        href="/dashboard/automations"
        icon={<ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        value={formatNumber(kpis.tasksThisWeek)}
        label={labels.tasksThisWeek}
      />
      <KpiCard
        href="/dashboard/automations"
        icon={<Clock className="h-6 w-6 text-purple-400 dark:text-purple-300" />}
        iconBg="bg-purple-50 dark:bg-purple-800/20"
        value={formatNumber(kpis.hoursSavedThisMonth, 1)}
        label={labels.hoursSavedThisMonth}
      />
    </div>
  );
}
