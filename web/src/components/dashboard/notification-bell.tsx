"use client";

import { useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Popover } from "radix-ui";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/utils/time";
import type { DashboardNotification } from "@/lib/dashboard/types";

interface NotificationBellProps {
  initialNotifications: DashboardNotification[];
  unreadCount: number;
  userId: string;
  translations: {
    title: string;
    markAllRead: string;
    empty: string;
  };
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

export function NotificationBell({
  initialNotifications,
  unreadCount,
  userId,
  translations,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [localUnread, setLocalUnread] = useState(unreadCount);
  const [open, setOpen] = useState(false);
  const tCommon = useTranslations("common");

  const markAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setLocalUnread(0);
    // Persist via browser Supabase client
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={translations.title}
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          {localUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none">
              {localUnread > 99 ? "99+" : localUnread}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="end"
          className="z-50 w-[380px] max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {translations.title}
            </h2>
            {localUnread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {translations.markAllRead}
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
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
                        onClick={() => setOpen(false)}
                      >
                        {item}
                      </a>
                    );
                  }

                  return item;
                })}
              </ul>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
