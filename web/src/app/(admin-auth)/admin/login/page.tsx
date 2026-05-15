import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * Standalone admin login page.
 *
 * Lives in the `(admin-auth)` route group so it does NOT inherit the
 * admin shell layout (sidebar/header) from the `(admin)` group.
 * Middleware routes already-authenticated staff away from this page.
 *
 * Strings come from the `admin.*` next-intl namespace (added in 17-03)
 * so EN/ES parity is enforced repository-wide.
 *
 * Admin login is intentionally dark in BOTH light- and dark-mode to signal
 * admin context. Uses inline Factory dark-base HEX (#020202 page,
 * #101010 card, #d6d3d2 body, #3d3a39 border) — NOT semantic tokens —
 * because semantic tokens (bg-background/bg-card) would force light-mode
 * rendering and erase the admin/customer visual distinction.
 * See Phase 25 RESEARCH Open Question 1.
 */
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { error } = await searchParams;
  const t = await getTranslations("admin");

  const errorMessage =
    error === "not_staff" ? t("login.errors.notStaff") : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020202] text-[#d6d3d2]">
      <div className="w-full max-w-md space-y-6 bg-[#101010] rounded-md p-8 border border-[#3d3a39]">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="AIDEAS"
            width={100}
            height={32}
            className="brightness-0 invert"
            priority
          />
          <span className="px-2 py-0.5 rounded-sm bg-primary text-primary-foreground text-xs font-bold tracking-wider">
            {t("badge")}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("login.title")}
          </h1>
          <p className="text-[#a49d9a] text-sm">{t("login.subtitle")}</p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <AdminLoginForm
          labels={{
            emailLabel: t("login.emailLabel"),
            passwordLabel: t("login.passwordLabel"),
            submit: t("login.submit"),
            submitting: t("login.submitting"),
            invalidCredentials: t("login.errors.invalidCredentials"),
            missingFields: t("login.errors.missingFields"),
            notStaff: t("login.errors.notStaff"),
          }}
        />
      </div>
    </div>
  );
}
