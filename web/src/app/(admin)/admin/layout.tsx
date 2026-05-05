import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createAdminServerClient } from "@/lib/supabase/admin-server";
import { assertPlatformStaff } from "@/lib/auth/assert-platform-staff";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

/**
 * Admin shell layout.
 *
 * Defense-in-depth auth gate: middleware already blocks /admin/* for non-staff,
 * but the layout repeats the assertPlatformStaff check so any future middleware
 * bypass cannot leak admin UI to unauthorized callers. Adds ~10ms per request.
 *
 * Renders the sidebar + header chrome around all /admin/* pages (except
 * /admin/login, which lives in the (admin-auth) route group and skips this
 * layout entirely).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAdminServerClient();
  const auth = await assertPlatformStaff(supabase);

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const t = await getTranslations("admin");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <AdminSidebar
        labels={{
          home: t("nav.home"),
          catalog: t("nav.catalog"),
          requests: t("nav.requests"),
          automations: t("nav.automations"),
          clients: t("nav.clients"),
          logout: t("nav.logout"),
        }}
      />
      <main className="lg:pl-60">
        <AdminHeader badgeLabel={t("badge")} subtitle={t("shell.subtitle")} />
        <div className="p-6 lg:px-10 lg:pb-8">{children}</div>
      </main>
    </div>
  );
}
