import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Zap, Shield, BarChart3 } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { LanguageSwitcher } from "@/components/auth/language-switcher";

export default async function SignupPage() {
  const t = await getTranslations("signup");

  const benefits = [
    { icon: Zap, text: t("branding.benefit1") },
    { icon: Shield, text: t("branding.benefit2") },
    { icon: BarChart3, text: t("branding.benefit3") },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-[#111] text-white relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-md w-full space-y-10">
          {/* Logo */}
          <div>
            <Image
              src="/logo.png"
              alt="AIDEAS"
              width={120}
              height={40}
              className="brightness-0 invert"
              priority
            />
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              {t("branding.headline")}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              {t("branding.subheadline")}
            </p>
          </div>

          {/* Benefits list */}
          <ul className="space-y-4">
            {benefits.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                  <Icon className="size-4 text-white" />
                </span>
                <span className="text-white/80 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        {/* Language switcher — absolute top right */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Mobile-only logo (shown when left panel is hidden) */}
          <div className="flex justify-center lg:hidden">
            <Image
              src="/logo.png"
              alt="AIDEAS"
              width={100}
              height={32}
              priority
            />
          </div>

          {/* Form header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
          </div>

          {/* Signup form */}
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
