"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { switchLocale, saveHourlyCost } from "@/lib/actions/settings";
import type { SettingsOrgData } from "@/lib/dashboard/types";

interface SettingsPreferencesCardProps {
  org: SettingsOrgData;
  translations: {
    title: string;
    language: string;
    languageHelp: string;
    hourlyCost: string;
    hourlyCostHelp: string;
    hourlyCostRole: string;
    save: string;
    saving: string;
    saved: string;
    languageOptions: {
      english: string;
      spanish: string;
    };
  };
}

type ToastState = { message: string; type: "success" | "error" } | null;

type HourlyCostFormValues = {
  hourlyCost: number;
};

function readLocaleCookie(): "en" | "es" {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  const value = match?.[1];
  return value === "es" ? "es" : "en";
}

export function SettingsPreferencesCard({
  org,
  translations,
}: SettingsPreferencesCardProps) {
  const router = useRouter();

  const [currentLocale, setCurrentLocale] = useState<"en" | "es">("en");
  const [isSwitchingLocale, setIsSwitchingLocale] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Read locale from cookie on mount
  useEffect(() => {
    setCurrentLocale(readLocaleCookie());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isAdminOrOwner = org.role === "owner" || org.role === "admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HourlyCostFormValues>({
    defaultValues: {
      hourlyCost: org.hourlyCost ?? 0,
    },
  });

  async function handleLocaleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value as "en" | "es";
    setIsSwitchingLocale(true);
    setCurrentLocale(selected);
    try {
      await switchLocale(selected);
      router.refresh();
    } finally {
      setIsSwitchingLocale(false);
    }
  }

  async function onSubmitHourlyCost(data: HourlyCostFormValues) {
    try {
      const result = await saveHourlyCost(org.orgId, data.hourlyCost);
      if ("error" in result) {
        setToast({ message: result.error, type: "error" });
      } else {
        setToast({ message: translations.saved, type: "success" });
      }
    } catch {
      setToast({ message: "Failed to save", type: "error" });
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {translations.title}
        </h2>

        {/* Language section */}
        <div>
          <label
            htmlFor="language-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {translations.language}
          </label>
          <select
            id="language-select"
            value={currentLocale}
            onChange={handleLocaleChange}
            disabled={isSwitchingLocale}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="en">{translations.languageOptions.english}</option>
            <option value="es">{translations.languageOptions.spanish}</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {translations.languageHelp}
          </p>
        </div>

        <div className="border-t my-4" />

        {/* Hourly cost section */}
        <form onSubmit={handleSubmit(onSubmitHourlyCost)}>

          <div className="mb-4">
            <label
              htmlFor="hourly-cost-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {translations.hourlyCost}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-gray-500 dark:text-gray-400 pointer-events-none">
                $
              </span>
              <input
                id="hourly-cost-input"
                type="number"
                step="0.01"
                min="0"
                max="10000"
                disabled={!isAdminOrOwner}
                {...register("hourlyCost", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
            {errors.hourlyCost && (
              <p className="mt-1 text-xs text-red-500">{errors.hourlyCost.message}</p>
            )}
            {!isAdminOrOwner ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.hourlyCostRole}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.hourlyCostHelp}
              </p>
            )}
          </div>

          {isAdminOrOwner && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? translations.saving : translations.save}
              </button>
            </div>
          )}
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
