import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * Standalone admin login page.
 *
 * Lives in the `(admin-auth)` route group so it does NOT inherit the
 * admin shell layout (sidebar/header) that 17-03 will introduce.
 * Middleware routes already-authenticated staff away from this page.
 */
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { error } = await searchParams;
  const errorMessage =
    error === "not_staff"
      ? "This account is not registered as platform staff. Sign in with a staff account or contact your administrator."
      : null;

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
            ADMIN
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Staff sign-in</h1>
          <p className="text-white/60 text-sm">
            For AIDEAS team members only.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <AdminLoginForm />
      </div>
    </div>
  );
}
