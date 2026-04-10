"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import type { User } from "@supabase/supabase-js";
import type { DashboardNotification } from "@/lib/dashboard/types";

interface DashboardNavProps {
  user: User;
  notifications?: DashboardNotification[];
}

export function DashboardNav({ user, notifications = [] }: DashboardNavProps) {
  const t = useTranslations("dashboard");
  const tNotif = useTranslations("dashboard.notifications");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: "📊" },
    { name: t("nav.automations"), href: "/dashboard/automations", icon: "⚡" },
    { name: t("nav.catalog"), href: "/dashboard/catalog", icon: "📚" },
    { name: t("nav.chat"), href: "/dashboard/chat", icon: "💬" },
    { name: t("nav.team"), href: "/dashboard/team", icon: "👥" },
    { name: t("nav.billing"), href: "/dashboard/billing", icon: "💳" },
    { name: t("nav.settings"), href: "/dashboard/settings", icon: "⚙️" },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="text-xl">☰</span>
        </button>
        <span className="font-bold text-xl">AIDEAS</span>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link href="/dashboard" className="font-bold text-2xl">
              AIDEAS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.first_name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              {t("signOut")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
