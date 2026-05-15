"use client";

import { useState } from "react";
import { signInStaff } from "@/lib/actions/admin-auth";

interface AdminLoginFormProps {
  labels: {
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    submitting: string;
    invalidCredentials: string;
    missingFields: string;
    notStaff: string;
  };
}

/**
 * Admin login form.
 *
 * Minimal email + password — no Google OAuth (staff use seeded email
 * accounts only in v1.2), no reCAPTCHA (internal users).
 *
 * Labels and error strings come from the parent server component which
 * resolves them via getTranslations("admin"). The signInStaff server
 * action returns server-side English error strings; we map them onto the
 * locale-aware labels here for display parity.
 */
export function AdminLoginForm({ labels }: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function localizeError(serverError: string): string {
    if (serverError === "Email and password are required.") {
      return labels.missingFields;
    }
    if (serverError === "Invalid credentials.") {
      return labels.invalidCredentials;
    }
    if (serverError === "This account is not registered as platform staff.") {
      return labels.notStaff;
    }
    return serverError;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signInStaff(formData);
    if (result?.error) {
      setError(localizeError(result.error));
      setPending(false);
    }
    // On success the server action redirects (throws NEXT_REDIRECT).
  }

  // Admin login form is intentionally dark — see admin/login/page.tsx header
  // for the Phase 25 RESEARCH Open Question 1 rationale. Inputs use Factory
  // dark-base HEX inline (not semantic tokens) to match the page's dark surface.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-[#d6d3d2]/80">
          {labels.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 rounded-sm bg-[#101010] border border-[#3d3a39] text-[#d6d3d2] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-[#d6d3d2]/80">
          {labels.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 rounded-sm bg-[#101010] border border-[#3d3a39] text-[#d6d3d2] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-sm bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground text-sm font-semibold transition-colors"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
