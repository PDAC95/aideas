"use client";

import { LogOut } from "lucide-react";
import { signOutStaff } from "@/lib/actions/admin-auth";

interface AdminSignOutProps {
  label: string;
}

/**
 * Sidebar logout button.
 *
 * Wraps the existing `signOutStaff` server action (from 17-02) in a form so
 * the click works without JavaScript. Clears only the sb-admin-* cookies —
 * any customer (sb-*) session in another tab is untouched.
 */
export function AdminSignOut({ label }: AdminSignOutProps) {
  return (
    <form action={signOutStaff}>
      <button
        type="submit"
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <LogOut className="h-[18px] w-[18px]" />
        {label}
      </button>
    </form>
  );
}
