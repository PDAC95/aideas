"use client";

import { useState } from "react";
import { signInStaff } from "@/lib/actions/admin-auth";

/**
 * Admin login form.
 *
 * Minimal email + password — no Google OAuth (staff use seeded email
 * accounts only in v1.2), no reCAPTCHA (internal users), no i18n yet
 * (literal English; 17-03 will wire next-intl admin namespace).
 */
export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signInStaff(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // On success the server action redirects (throws NEXT_REDIRECT).
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-md bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white text-sm font-semibold transition-colors"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
