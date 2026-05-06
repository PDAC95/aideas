import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AuthSync } from "@/components/auth/auth-sync";
import type { DashboardNotification } from "@/lib/dashboard/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch notifications once — passed to both DashboardHeader (desktop) and DashboardNav (mobile)
  const { data: notificationsRaw } = await supabase
    .from("notifications")
    .select("id, type, title, message, is_read, read_at, link, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const notifications = (notificationsRaw ?? []) as DashboardNotification[];

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-900">
      <AuthSync />
      <DashboardNav user={user} notifications={notifications} />
      <main className="lg:pl-64">
        <DashboardHeader user={user} notifications={notifications} />
        <div className="p-4 lg:px-8 lg:pb-6">{children}</div>
      </main>
    </div>
  );
}
