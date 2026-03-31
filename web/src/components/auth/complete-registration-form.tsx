"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  completeRegistrationSchema,
  type CompleteRegistrationData,
} from "@/lib/validations/signup";
import { completeRegistration } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompleteRegistrationForm() {
  const t = useTranslations("completeRegistration");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompleteRegistrationData>({
    resolver: zodResolver(completeRegistrationSchema),
    mode: "onBlur",
  });

  const handleFormSubmit = async (data: CompleteRegistrationData) => {
    const result = await completeRegistration(data);

    if ("error" in result) {
      if (result.error === "not_authenticated") {
        router.push("/login");
        return;
      }
      setError("root", { message: result.error });
      return;
    }

    router.push("/verify-email");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="space-y-4">
        {/* Root error */}
        {errors.root && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.root.message}
          </div>
        )}

        {/* Company name */}
        <div className="space-y-1.5">
          <Label htmlFor="companyName">{t("company")}</Label>
          <Input
            id="companyName"
            placeholder="Acme Inc."
            autoFocus
            aria-invalid={!!errors.companyName}
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </form>
  );
}
