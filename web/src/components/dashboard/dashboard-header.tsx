import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Search, PlusSquare, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { LanguageSwitcher } from "./language-switcher";
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
  const tLang = await getTranslations("dashboard.settings.languageOptions");
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const currentLocale: "en" | "es" = cookieLocale === "es" ? "es" : "en";

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
    <header className="hidden lg:flex items-center gap-4 px-8 pt-8 pb-4 border-b border-border bg-background">
      {/* Search bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("header.search")}
          className="w-full pl-12 pr-5 py-4.5 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-shadow"
        />
      </div>

      <div className="flex items-center gap-5 ml-auto">
        {/* Create Agent button */}
        <Link
          href="/dashboard/catalog"
          className="inline-flex items-center gap-3 px-8 py-4.5 rounded-full bg-card border border-border text-foreground text-sm font-medium transition-colors hover:bg-muted"
        >
          <PlusSquare className="h-4 w-4" />
          {t("header.createAgent")}
        </Link>

        {/* Language switcher */}
        <LanguageSwitcher
          initialLocale={currentLocale}
          labels={{
            english: tLang("english"),
            spanish: tLang("spanish"),
          }}
        />

        {/* Notification + Inbox pill */}
        <div className="flex items-center bg-card border border-border rounded-full px-4 py-2.5">
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
          <div className="w-px h-6 bg-border mx-2" />
          <Link
            href="/dashboard/chat"
            className="p-2.5 rounded-full hover:bg-muted transition-colors"
            title={t("header.inbox")}
          >
            <Inbox className="h-5 w-5 text-muted-foreground" />
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
