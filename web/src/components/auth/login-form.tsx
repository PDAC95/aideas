"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations/login";
import { signInWithEmail } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";

interface LoginFormProps {
  sessionExpired?: boolean;
  authError?: boolean;
  verified?: boolean;
}

export function LoginForm({ sessionExpired, authError, verified }: LoginFormProps) {
  const t = useTranslations("login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthError, setShowAuthError] = useState(authError ?? false);
  const [showSessionExpired, setShowSessionExpired] = useState(
    sessionExpired ?? false
  );
  const [showVerified, setShowVerified] = useState(verified ?? false);

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);

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

  // Initialize rate limit state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("login_failed_attempts");
      if (!stored) return;
      const { count, lockedUntil: until } = JSON.parse(stored) as {
        count: number;
        lockedUntil: number | null;
      };
      if (until && Date.now() < until) {
        setFailedAttempts(count);
        setLockedUntil(until);
      } else {
        localStorage.removeItem("login_failed_attempts");
      }
    } catch {
      /* ignore corrupt localStorage */
    }
  }, []);

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

  // Auto-dismiss verified banner after 5 seconds
  useEffect(() => {
    if (showVerified) {
      const timer = setTimeout(() => setShowVerified(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showVerified]);

  // Countdown timer for lockout display
  useEffect(() => {
    if (!lockedUntil) return;
    const update = () => {
      const remaining = Math.max(0, lockedUntil - Date.now());
      setLockoutMinutes(Math.ceil(remaining / 60000));
      if (remaining <= 0) {
        setLockedUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem("login_failed_attempts");
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleFormSubmit = async (data: LoginFormData) => {
    // Check rate limit lock
    if (lockedUntil && Date.now() < lockedUntil) return;

    const result = await signInWithEmail({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe ?? false,
    });

    if ("error" in result) {
      if (result.error === "email_not_verified") {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }

      if (result.error === "invalid_credentials") {
        setValue("password", ""); // Clear password field per CONTEXT.md
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);

        if (newCount >= 5) {
          const until = Date.now() + 10 * 60 * 1000; // 10 minutes lockout
          setLockedUntil(until);
          localStorage.setItem(
            "login_failed_attempts",
            JSON.stringify({ count: newCount, lockedUntil: until })
          );
        } else {
          localStorage.setItem(
            "login_failed_attempts",
            JSON.stringify({ count: newCount, lockedUntil: null })
          );
          setError("root", { message: "invalidCredentials" });
        }
        return;
      }

      // Generic error
      setError("root", { message: "generic" });
      return;
    }

    // Success — clear rate limit state and redirect
    localStorage.removeItem("login_failed_attempts");
    setFailedAttempts(0);
    setLockedUntil(null);
    router.push("/dashboard");
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
        {/* Email verified success banner */}
        {showVerified && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-300 flex items-center justify-between">
            <span>{t("verified")}</span>
            <button
              type="button"
              onClick={() => setShowVerified(false)}
              className="ml-2 text-green-500 hover:text-green-700 font-medium"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

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
        {errors.root && !isLocked && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {rootErrorMessage}
          </div>
        )}

        {/* Lockout banner */}
        {isLocked && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("errors.tooManyAttempts", { minutes: lockoutMinutes })}
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
