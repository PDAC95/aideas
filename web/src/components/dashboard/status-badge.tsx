import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        in_setup: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
        pending_review: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
        draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
);

type AutomationStatus = "active" | "paused" | "failed" | "in_setup" | "pending_review" | "draft" | "archived";

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: AutomationStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ status }), className)}>
      {label}
    </span>
  );
}
