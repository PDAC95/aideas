"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

interface LoginFormProps {
  sessionExpired?: boolean;
  authError?: boolean;
}

export function LoginForm({ sessionExpired, authError }: LoginFormProps) {
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthError, setShowAuthError] = useState(authError ?? false);
  const [showSessionExpired, setShowSessionExpired] = useState(
    sessionExpired ?? false
  );

  // Rate limiting state (Plan 02 activates)
  const [, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { rememberMe: false },
  });

  // Auto-dismiss auth error after 5 seconds
  useEffect(() => {
    if (showAuthError) {
      const timer = setTimeout(() => setShowAuthError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showAuthError]);

  // Auto-dismiss session expired after 5 seconds
  useEffect(() => {
    if (showSessionExpired) {
      const timer = setTimeout(() => setShowSessionExpired(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSessionExpired]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || lockedUntil === null) return;

    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setRemainingMinutes(0);
        clearInterval(interval);
      } else {
        setRemainingMinutes(Math.ceil(remaining / 60000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const handleFormSubmit = async (data: LoginFormData) => {
    // Plan 02 will wire the actual Server Action here
    // For now, placeholder so the form is testable
    console.log("Login submit:", data);

    // Stub: prepare error handler pattern for Plan 02
    // On auth failure Plan 02 will call:
    //   setFailedAttempts((n) => n + 1)
    //   setValue("password", "")
    //   setError("root", { message: "invalidCredentials" })
    void setFailedAttempts;
    void setLockedUntil;
    void setValue;
    void setError;
  };

  // Resolve root error message: if it matches a known i18n key, translate it; otherwise show raw
  const rootErrorMessage = errors.root?.message
    ? (() => {
        const knownKeys = [
          "invalidCredentials",
          "emailNotVerified",
          "tooManyAttempts",
          "generic",
          "authError",
        ] as const;
        type ErrorKey = (typeof knownKeys)[number];
        const isKnownKey = (k: string): k is ErrorKey =>
          knownKeys.includes(k as ErrorKey);
        return isKnownKey(errors.root!.message!)
          ? t(`errors.${errors.root!.message as ErrorKey}`)
          : errors.root.message;
      })()
    : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="space-y-4">
        {/* Session expired banner */}
        {showSessionExpired && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700 flex items-center justify-between">
            <span>{t("sessionExpired")}</span>
            <button
              type="button"
              onClick={() => setShowSessionExpired(false)}
              className="ml-2 text-blue-500 hover:text-blue-700 font-medium"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Auth error banner */}
        {showAuthError && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center justify-between">
            <span>{t("errors.authError")}</span>
            <button
              type="button"
              onClick={() => setShowAuthError(false)}
              className="ml-2 text-destructive/70 hover:text-destructive font-medium"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Root / server error */}
        {errors.root && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {isLocked
              ? t("errors.tooManyAttempts", { minutes: remainingMinutes })
              : rootErrorMessage}
          </div>
        )}

        {/* Lockout banner (no root error set, just locked) */}
        {isLocked && !errors.root && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("errors.tooManyAttempts", { minutes: remainingMinutes })}
          </div>
        )}

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
            <p className="text-xs text-destructive">{errors.email.message}</p>
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
              autoComplete="current-password"
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
        </div>

        {/* Remember me + Forgot password row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
              {...register("rememberMe")}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal cursor-pointer"
            >
              {t("rememberMe")}
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLocked}
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
        <GoogleOAuthButton redirectTo="/dashboard" />

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline hover:no-underline"
          >
            {t("register")}
          </Link>
        </p>
      </div>
    </form>
  );
}
