import { getTranslations } from "next-intl/server";
import { CompleteRegistrationForm } from "@/components/auth/complete-registration-form";

export default async function CompleteRegistrationPage() {
  const t = await getTranslations("completeRegistration");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <CompleteRegistrationForm />
      </div>
    </div>
  );
}
