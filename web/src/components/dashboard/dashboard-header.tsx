import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search, PlusSquare, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
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
  const t = await getTranslations("dashboard");
  const tNotif = await getTranslations("dashboard.notifications");
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch fresh name from profiles table (source of truth), fallback to auth metadata
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, avatar_url")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || (user.user_metadata?.first_name as string) || "";
  const displayName = firstName || user.email?.split("@")[0] || "User";
  const avatarInitial = (firstName || user.email || "U").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <header className="hidden lg:flex items-center gap-4 px-8 pt-8 pb-4">
      {/* Search bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t("header.search")}
          className="w-full pl-12 pr-5 py-4.5 rounded-full bg-gray-300/70 dark:bg-gray-700 border-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300/30 transition-shadow"
        />
      </div>

      <div className="flex items-center gap-5 ml-auto">
        {/* Create Agent button */}
        <Link
          href="/dashboard/catalog"
          className="inline-flex items-center gap-3 px-8 py-4.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-medium shadow-sm hover:shadow transition-all"
        >
          <PlusSquare className="h-4 w-4" />
          {t("header.createAgent")}
        </Link>

        {/* Notification + Inbox pill */}
        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm px-4 py-2.5">
          <NotificationBell
            initialNotifications={notifications}
            unreadCount={unreadCount}
            userId={user.id}
            translations={{
              title: tNotif("title"),
              markAllRead: tNotif("markAllRead"),
              empty: tNotif("empty"),
            }}
          />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
          <Link
            href="/dashboard/chat"
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t("header.inbox")}
          >
            <Inbox className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>

        {/* User avatar + name + dropdown */}
        <UserMenu
          avatarInitial={avatarInitial}
          avatarUrl={avatarUrl}
          displayName={displayName}
          translations={{
            profile: t("header.profile"),
            settings: t("nav.settings"),
            signOut: t("signOut"),
          }}
        />
      </div>
    </header>
  );
}
