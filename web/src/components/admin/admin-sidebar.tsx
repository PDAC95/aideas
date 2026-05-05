"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Inbox, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSignOut } from "./admin-sign-out";

interface AdminSidebarProps {
  labels: {
    home: string;
    catalog: string;
    requests: string;
    automations: string;
    clients: string;
    logout: string;
  };
}

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

/**
 * Admin sidebar — fresh component, NOT a reuse of customer DashboardNav.
 *
 * Distinct visual style: dark gray-900 background, orange accents on active
 * items (matches the ADMIN badge), white text. Mirrors the DashboardNav
 * structural pattern (mobile drawer + desktop fixed sidebar) but does not
 * import any customer dashboard components.
 *
 * Logout is pinned at the bottom of the sidebar via AdminSignOut, which
 * wraps the existing signOutStaff server action.
 */
export function AdminSidebar({ labels }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: SidebarItem[] = [
    { href: "/admin", label: labels.home, icon: Home, exact: true },
    { href: "/admin/catalog", label: labels.catalog, icon: BookOpen },
    { href: "/admin/requests", label: labels.requests, icon: Inbox },
    { href: "/admin/automations", label: labels.automations, icon: Zap },
    { href: "/admin/clients", label: labels.clients, icon: Building2 },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 text-white">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md hover:bg-gray-800"
          aria-label="Toggle navigation"
        >
          <span className="text-xl">☰</span>
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="AIDEAS"
            width={24}
            height={24}
            className="brightness-0 invert"
          />
          <span className="px-1.5 py-0.5 rounded bg-orange-500 text-[10px] font-bold tracking-wider text-white">
            ADMIN
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-gray-900 border-r border-gray-800 text-white flex flex-col">
            <SidebarContent
              items={items}
              isActive={isActive}
              onNav={() => setMobileOpen(false)}
              logoutLabel={labels.logout}
            />
          </aside>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-full w-60 flex-col bg-gray-900 border-r border-gray-800 text-white">
        <SidebarContent
          items={items}
          isActive={isActive}
          logoutLabel={labels.logout}
        />
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

function SidebarContent({
  items,
  isActive,
  onNav,
  logoutLabel,
}: {
  items: SidebarItem[];
  isActive: (href: string, exact?: boolean) => boolean;
  onNav?: () => void;
  logoutLabel: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-800">
        <Image
          src="/logo.png"
          alt="AIDEAS"
          width={28}
          height={28}
          className="brightness-0 invert"
        />
        <Link href="/admin" className="font-bold text-lg" onClick={onNav}>
          AIDEAS
        </Link>
        <span className="ml-auto px-1.5 py-0.5 rounded bg-orange-500 text-[10px] font-bold tracking-wider text-white">
          ADMIN
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-orange-500/15 text-orange-300"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <AdminSignOut label={logoutLabel} />
      </div>
    </>
  );
}
