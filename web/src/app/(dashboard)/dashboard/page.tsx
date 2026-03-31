import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { DashboardSignOut } from "@/components/dashboard/sign-out";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("dashboard");
  const firstName = (user?.user_metadata?.first_name as string) || "";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">
          {firstName ? t("greetingWithName", { name: firstName }) : t("greeting")}
        </h1>
        <p className="text-muted-foreground mb-6">{t("subtitle")}</p>
        <DashboardSignOut label={t("signOut")} />
      </div>
    </div>
  );
}
