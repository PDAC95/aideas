"use client";

import { useState } from "react";
import { CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils/time";
import type { DashboardNotification } from "@/lib/dashboard/types";

interface NotificationsListProps {
  initialNotifications: DashboardNotification[];
  unreadCount: number;
  userId: string;
  translations: {
    markAllRead: string;
    empty: string;
  };
  onItemClick?: () => void;
}

function NotificationIcon({ type }: { type: DashboardNotification["type"] }) {
  switch (type) {
    case "success":
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
      );
    case "info":
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "warning":
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
      );
    case "action_required":
      return (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
      );
  }
}

export function NotificationsList({
  initialNotifications,
  unreadCount,
  userId,
  translations,
  onItemClick,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [localUnread, setLocalUnread] = useState(unreadCount);
  const tCommon = useTranslations("common");

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setLocalUnread(0);
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);
  };

  return (
    <>
      {localUnread > 0 && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={markAllRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {translations.markAllRead}
          </button>
        </div>
      )}
      {notifications.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
          {translations.empty}
        </div>
      ) : (
        <ul>
          {notifications.map((notification) => {
            const item = (
              <li
                key={notification.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-b-0"
              >
                <NotificationIcon type={notification.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-snug">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatRelativeTime(notification.created_at, tCommon)}
                  </p>
                </div>
                {!notification.is_read && (
                  <span className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                )}
              </li>
            );

            if (notification.link) {
              return (
                <a
                  key={notification.id}
                  href={notification.link}
                  className="block"
                  onClick={onItemClick}
                >
                  {item}
                </a>
              );
            }

            return item;
          })}
        </ul>
      )}
    </>
  );
}
