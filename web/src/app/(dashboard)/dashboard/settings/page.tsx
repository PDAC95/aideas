import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId, fetchSettingsData } from "@/lib/dashboard/queries";
import { SettingsProfileCard } from "@/components/dashboard/settings-profile-card";
import { SettingsPreferencesCard } from "@/components/dashboard/settings-preferences-card";
import { SettingsSecurityCard } from "@/components/dashboard/settings-security-card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orgId = await getOrgId(user.id);
  if (!orgId) return null;

  const [{ profile, org }, t] = await Promise.all([
    fetchSettingsData(user.id, orgId),
    getTranslations("dashboard.settings"),
  ]);

  const isOAuthOnly = !user.identities?.some((id) => id.provider === "email");

  const profileTranslations = {
    title: t("profile.title"),
    firstName: t("profile.firstName"),
    lastName: t("profile.lastName"),
    email: t("profile.email"),
    emailHelp: t("profile.emailHelp"),
    avatar: t("profile.avatar"),
    changeAvatar: t("profile.changeAvatar"),
    removeAvatar: t("profile.removeAvatar"),
    avatarHelp: t("profile.avatarHelp"),
    save: t("profile.save"),
    saving: t("profile.saving"),
    saved: t("profile.saved"),
    error: t("profile.error"),
    companyName: t("preferences.companyName"),
    companyNameHelp: t("preferences.companyNameHelp"),
    hourlyCostRole: t("preferences.hourlyCostRole"),
  };

  const preferencesTranslations = {
    title: t("preferences.title"),
    language: t("preferences.language"),
    languageHelp: t("preferences.languageHelp"),
    hourlyCost: t("preferences.hourlyCost"),
    hourlyCostHelp: t("preferences.hourlyCostHelp"),
    hourlyCostRole: t("preferences.hourlyCostRole"),
    save: t("preferences.save"),
    saving: t("preferences.saving"),
    saved: t("preferences.saved"),
    languageOptions: {
      english: t("languageOptions.english"),
      spanish: t("languageOptions.spanish"),
    },
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <SettingsProfileCard
        userId={user.id}
        profile={profile}
        org={org}
        translations={profileTranslations}
      />

      <SettingsPreferencesCard
        org={org}
        translations={preferencesTranslations}
      />

      <SettingsSecurityCard
        isOAuthOnly={isOAuthOnly}
        translations={{
          title: t("security.title"),
          changePassword: t("security.changePassword"),
          currentPassword: t("security.currentPassword"),
          newPassword: t("security.newPassword"),
          confirmPassword: t("security.confirmPassword"),
          changePasswordBtn: t("security.changePasswordBtn"),
          changingPassword: t("security.changingPassword"),
          passwordChanged: t("security.passwordChanged"),
          wrongCurrentPassword: t("security.wrongCurrentPassword"),
          sessions: t("security.sessions"),
          sessionsDescription: t("security.sessionsDescription"),
          signOutOthers: t("security.signOutOthers"),
          signOutOthersConfirmTitle: t("security.signOutOthersConfirmTitle"),
          signOutOthersConfirmMessage: t("security.signOutOthersConfirmMessage"),
          signOutOthersConfirmBtn: t("security.signOutOthersConfirmBtn"),
          signOutOthersCancel: t("security.signOutOthersCancel"),
          signOutOthersSuccess: t("security.signOutOthersSuccess"),
        }}
      />
    </div>
  );
}
