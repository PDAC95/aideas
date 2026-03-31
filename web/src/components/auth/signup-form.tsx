"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/validations/signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthBar } from "@/components/auth/password-strength-bar";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { cn } from "@/lib/utils";

interface SignupFormProps {
  onSubmit?: (
    data: SignupFormData
  ) => Promise<{ error?: string; field?: string } | void>;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const t = useTranslations("signup");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      locale: locale as "en" | "es",
    },
  });

  const watchedPassword = watch("password") ?? "";

  const handleFormSubmit = async (data: SignupFormData) => {
    // Stamp terms acceptance time and locale
    const payload: SignupFormData = {
      ...data,
      termsAcceptedAt: new Date().toISOString(),
      locale: locale as "en" | "es",
    };

    if (!onSubmit) return;

    const result = await onSubmit(payload);
    if (result?.error) {
      const field = result.field as keyof SignupFormData | undefined;
      if (field) {
        setError(field, { message: result.error });
      } else {
        setError("root", { message: result.error });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="space-y-4">
        {/* Root / server error */}
        {errors.root && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.root.message}
          </div>
        )}

        {/* First name + Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input
              id="firstName"
              placeholder={t("firstNamePlaceholder")}
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input
              id="lastName"
              placeholder={t("lastNamePlaceholder")}
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Company name */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName">{t("company")}</Label>
          <Input
            id="companyName"
            placeholder={t("companyPlaceholder")}
            aria-invalid={!!errors.companyName}
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">
              {errors.email.message === "email_exists" ? (
                <>
                  {t("errors.emailExists")}{" "}
                  <Link
                    href="/login"
                    className="underline hover:text-foreground"
                  >
                    {t("errors.emailExistsLink")}
                  </Link>
                </>
              ) : (
                errors.email.message
              )}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
          <PasswordStrengthBar password={watchedPassword} />
        </div>

        {/* Terms checkbox */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <input
              id="termsAccepted"
              type="checkbox"
              value="true"
              className={cn(
                "mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer",
                errors.termsAccepted && "border-destructive"
              )}
              {...register("termsAccepted")}
            />
            <Label
              htmlFor="termsAccepted"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              {t("terms")}{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {t("termsLink")}
              </Link>{" "}
              {t("and")}{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {t("privacyLink")}
              </Link>
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-xs text-destructive">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        {/* Hidden locale field */}
        <input type="hidden" {...register("locale")} value={locale} />

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("or")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth */}
        <GoogleOAuthButton />

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-medium text-foreground underline hover:no-underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </form>
  );
}
