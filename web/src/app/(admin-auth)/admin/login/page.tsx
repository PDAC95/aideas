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
 */
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { error } = await searchParams;
  const t = await getTranslations("admin");

  const errorMessage =
    error === "not_staff" ? t("login.errors.notStaff") : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#111] text-white">
      <div className="w-full max-w-md space-y-6 bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="AIDEAS"
            width={100}
            height={32}
            className="brightness-0 invert"
            priority
          />
          <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-xs font-bold tracking-wider">
            {t("badge")}
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("login.title")}
          </h1>
          <p className="text-white/60 text-sm">{t("login.subtitle")}</p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
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
