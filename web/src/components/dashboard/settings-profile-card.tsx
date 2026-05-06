"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { saveProfileName, saveAvatarUrl, saveCompanyName } from "@/lib/actions/settings";
import { profileSchema } from "@/lib/validations/settings";

// Form type with lastName always string (Zod infers optional, but default('') ensures string at runtime)
type ProfileFormValues = {
  firstName: string;
  lastName: string;
};
import type { SettingsProfileData, SettingsOrgData } from "@/lib/dashboard/types";

interface SettingsProfileCardProps {
  userId: string;
  profile: SettingsProfileData | null;
  org: SettingsOrgData;
  translations: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    emailHelp: string;
    avatar: string;
    changeAvatar: string;
    removeAvatar: string;
    avatarHelp: string;
    save: string;
    saving: string;
    saved: string;
    error: string;
    companyName: string;
    companyNameHelp: string;
    hourlyCostRole: string;
  };
}

type ToastState = { message: string; type: "success" | "error" } | null;

export function SettingsProfileCard({
  userId,
  profile,
  org,
  translations,
}: SettingsProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar state
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    profile?.avatarUrl ?? null
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Company name state
  const [companyName, setCompanyName] = useState(org.orgName ?? "");

  // Loading / toast
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as import("react-hook-form").Resolver<ProfileFormValues>,
    defaultValues: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
    },
  });

  const isAdminOrOwner = org.role === "owner" || org.role === "admin";

  // Initials fallback
  const initials = [
    profile?.firstName?.charAt(0),
    profile?.lastName?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  const displayAvatarUrl = previewUrl ?? (currentAvatarUrl ? `${currentAvatarUrl}` : null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "File must be 2MB or less", type: "error" });
      return;
    }

    // Revoke previous preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(url);
  }

  async function handleRemoveAvatar() {
    if (!currentAvatarUrl) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      const ext = currentAvatarUrl.split(".").pop()?.split("?")[0] ?? "jpg";
      await supabase.storage.from("avatars").remove([`${userId}/avatar.${ext}`]);
      const result = await saveAvatarUrl(null);
      if ("error" in result) {
        setToast({ message: translations.error, type: "error" });
      } else {
        setCurrentAvatarUrl(null);
        setPendingFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setToast({ message: translations.saved, type: "success" });
      }
    } catch {
      setToast({ message: translations.error, type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);

    try {
      // 1. Upload avatar if pending
      if (pendingFile) {
        const supabase = createClient();
        const ext = pendingFile.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, pendingFile, { upsert: true, contentType: pendingFile.type });

        if (uploadError) {
          setToast({ message: translations.error, type: "error" });
          setIsSaving(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        const avatarUrlWithBust = `${publicData.publicUrl}?v=${Date.now()}`;
        const avatarResult = await saveAvatarUrl(avatarUrlWithBust);
        if ("error" in avatarResult) {
          setToast({ message: translations.error, type: "error" });
          setIsSaving(false);
          return;
        }
        setCurrentAvatarUrl(avatarUrlWithBust);
        setPendingFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }

      // 2. Save profile name
      const nameResult = await saveProfileName(data.firstName, data.lastName ?? "");
      if ("error" in nameResult) {
        setToast({ message: translations.error, type: "error" });
        setIsSaving(false);
        return;
      }

      // 3. Save company name (owner/admin only, if changed)
      if (isAdminOrOwner && companyName.trim() !== (org.orgName ?? "")) {
        const companyResult = await saveCompanyName(org.orgId, companyName);
        if ("error" in companyResult) {
          setToast({ message: companyResult.error, type: "error" });
          setIsSaving(false);
          return;
        }
      }

      setToast({ message: translations.saved, type: "success" });
    } catch {
      setToast({ message: translations.error, type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {translations.title}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translations.avatar}
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar display */}
              <div className="relative h-16 w-16 shrink-0">
                {displayAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayAvatarUrl}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xl font-semibold text-purple-600 dark:text-purple-300">
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Avatar actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {translations.changeAvatar}
                  </button>
                  {(currentAvatarUrl || previewUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isSaving}
                      className="text-sm px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {translations.removeAvatar}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {translations.avatarHelp}
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.firstName}
            </label>
            <input
              {...register("firstName")}
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.lastName}
            </label>
            <input
              {...register("lastName")}
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.email}
            </label>
            <input
              type="email"
              value={profile?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {translations.emailHelp}
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translations.companyName}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={!isAdminOrOwner}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            {!isAdminOrOwner && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.hourlyCostRole}
              </p>
            )}
            {isAdminOrOwner && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.companyNameHelp}
              </p>
            )}
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? translations.saving : translations.save}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
