"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  MessageSquare,
  Users,
  CreditCard,
  Settings,
  LogOut,
  MessageCircleQuestion,
  LifeBuoy,
  Mail,
  EllipsisVertical,
  Search,
  Plus,
  Inbox,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.automations"), href: "/dashboard/automations", icon: Zap },
    { name: t("nav.catalog"), href: "/dashboard/catalog", icon: BookOpen },
    { name: t("nav.chat"), href: "/dashboard/chat", icon: MessageSquare },
    { name: t("nav.team"), href: "/dashboard/team", icon: Users },
    { name: t("nav.billing"), href: "/dashboard/billing", icon: CreditCard },
    { name: t("nav.settings"), href: "/dashboard/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

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
        <div className="flex items-center gap-2">
          <Image src="/logo-color.png" alt="AIDEAS" width={24} height={24} />
          <span className="font-bold text-xl">AIDEAS</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <EllipsisVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("header.search")}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300/20"
                    />
                  </div>
                </div>

                {/* Create Agent */}
                <Link
                  href="/dashboard/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-purple-400 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t("header.createAgent")}
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-700" />

                {/* Notifications */}
                <div className="px-4 py-3">
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

                {/* Inbox */}
                <Link
                  href="/dashboard/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Inbox className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {t("header.inbox")}
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-700" />

                {/* Profile */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {t("header.profile")}
                </Link>

                {/* Sign out */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar — full height slide-in */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center gap-2 h-16 border-b">
            <Image src="/logo-color.png" alt="AIDEAS" width={28} height={28} />
            <Link href="/dashboard" className="font-bold text-2xl">
              AIDEAS
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    active
                      ? "bg-purple-50 text-purple-500 dark:bg-purple-800/20 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">{t("signOut")}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop floating sidebar */}
      <aside className="hidden lg:flex fixed top-8 left-4 z-50 w-56 flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <Image src="/logo-color.png" alt="AIDEAS" width={32} height={32} className="shrink-0" />
          <Link href="/dashboard" className="font-bold text-lg text-gray-900 dark:text-white">
            AIDEAS
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-2 space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-purple-50 text-purple-500 dark:bg-purple-800/20 dark:text-purple-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", active && "text-purple-400 dark:text-purple-300")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Desktop floating utility bar — bottom left, same width as sidebar (w-56) */}
      <div className="hidden lg:flex fixed bottom-4 left-4 z-50 w-56 items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
        <Link
          href="/dashboard/faq"
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title={t("nav.faq")}
        >
          <MessageCircleQuestion className="h-[18px] w-[18px]" />
        </Link>
        <Link
          href="/dashboard/help"
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title={t("nav.help")}
        >
          <LifeBuoy className="h-[18px] w-[18px]" />
        </Link>
        <Link
          href="/dashboard/contact"
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          title={t("nav.contact")}
        >
          <Mail className="h-[18px] w-[18px]" />
        </Link>
        <button
          onClick={handleSignOut}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title={t("signOut")}
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
