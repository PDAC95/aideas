import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import type { DashboardNotification } from "@/lib/dashboard/types";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notificationsRaw } = await supabase
    .from("notifications")
    .select("id, type, title, message, is_read, read_at, link, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (notificationsRaw ?? []) as DashboardNotification[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const tNotif = await getTranslations("dashboard.notifications");

  return (
    <div className="-mx-4 -mt-4 lg:mx-0 lg:mt-0">
      {/* Mobile back link */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <Link
          href="/dashboard"
          className="p-1 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {tNotif("title")}
        </h1>
      </div>

      {/* Desktop title */}
      <div className="hidden lg:block mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tNotif("title")}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 lg:rounded-xl lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:shadow-sm overflow-hidden">
        <NotificationsList
          initialNotifications={notifications}
          unreadCount={unreadCount}
          userId={user.id}
          translations={{
            markAllRead: tNotif("markAllRead"),
            empty: tNotif("empty"),
          }}
        />
      </div>
    </div>
  );
}
