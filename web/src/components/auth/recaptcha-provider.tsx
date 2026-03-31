"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
