import { getTranslations } from "next-intl/server";
import { NotificationBell } from "./notification-bell";
import type { DashboardNotification } from "@/lib/dashboard/types";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
  notifications: DashboardNotification[];
}

export async function DashboardHeader({
  user,
  notifications,
}: DashboardHeaderProps) {
  const t = await getTranslations("dashboard.notifications");
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="hidden lg:flex fixed top-0 right-0 left-64 h-16 items-center justify-end px-6 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 dark:border-gray-700 z-30">
      <div className="flex items-center gap-3">
        <NotificationBell
          initialNotifications={notifications}
          unreadCount={unreadCount}
          userId={user.id}
          translations={{
            title: t("title"),
            markAllRead: t("markAllRead"),
            empty: t("empty"),
          }}
        />
        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium select-none">
          {user.email?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
