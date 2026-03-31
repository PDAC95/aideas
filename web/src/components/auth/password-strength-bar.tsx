"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PasswordStrengthBarProps {
  password: string;
}

type StrengthLevel = "empty" | "weak" | "medium" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return "empty";

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLongLength = password.length >= 12;

  const meetsMinimum = hasMinLength && hasUppercase && hasNumber;

  if (!meetsMinimum) return "weak";
  if (meetsMinimum && hasSpecial && hasLongLength) return "strong";
  return "medium";
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const t = useTranslations("signup.passwordStrength");
  const strength = getPasswordStrength(password);

  if (strength === "empty") return null;

  const segments = [
    { active: true, color: "bg-red-500" },
    { active: strength === "medium" || strength === "strong", color: "bg-yellow-500" },
    { active: strength === "strong", color: "bg-green-500" },
  ];

  const activeColor =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
        ? "bg-yellow-500"
        : "bg-green-500";

  const labelColor =
    strength === "weak"
      ? "text-red-500"
      : strength === "medium"
        ? "text-yellow-600"
        : "text-green-600";

  const label =
    strength === "weak"
      ? t("weak")
      : strength === "medium"
        ? t("medium")
        : t("strong");

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              seg.active ? activeColor : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", labelColor)}>{label}</p>
    </div>
  );
}
