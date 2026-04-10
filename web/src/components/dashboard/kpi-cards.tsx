import Link from "next/link";
import { Zap, ListChecks, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiData } from "@/lib/dashboard/types";

interface KpiCardsProps {
  kpis: KpiData;
  labels: {
    activeAutomations: string;
    tasksThisWeek: string;
    hoursSavedThisMonth: string;
  };
  trends: {
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

interface TrendIndicatorProps {
  trend: string;
}

function TrendIndicator({ trend }: TrendIndicatorProps) {
  const isDown = trend.startsWith("-");
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium mt-1.5",
        isDown ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
      )}
    >
      {isDown ? (
        <TrendingDown className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <TrendingUp className="h-3.5 w-3.5 shrink-0" />
      )}
      <span>{trend}</span>
    </div>
  );
}

interface KpiCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  trend: string;
}

function KpiCard({ href, icon, iconBg, value, label, trend }: KpiCardProps) {
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
          <TrendIndicator trend={trend} />
        </div>
      </div>
    </Link>
  );
}

export function KpiCards({ kpis, labels, trends }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      <KpiCard
        href="/dashboard/automations"
        icon={<Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        value={formatNumber(kpis.activeAutomations)}
        label={labels.activeAutomations}
        trend={trends.activeAutomations}
      />
      <KpiCard
        href="/dashboard/automations"
        icon={<ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        value={formatNumber(kpis.tasksThisWeek)}
        label={labels.tasksThisWeek}
        trend={trends.tasksThisWeek}
      />
      <KpiCard
        href="/dashboard/automations"
        icon={<Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        value={formatNumber(kpis.hoursSavedThisMonth, 1)}
        label={labels.hoursSavedThisMonth}
        trend={trends.hoursSavedThisMonth}
      />
    </div>
  );
}
