# Phase 21 — Deferred Items

Items discovered during Phase 21 execution that are out of scope for the current plan.

---

## 21-01

### Pre-existing build environment issue: Google Fonts fetch fails

**Discovered:** 2026-05-08, plan 21-01 verification (`npm run build`)

**Surface:** `web/src/app/layout.tsx` imports `Geist` and `Geist Mono` from `next/font/google`. Turbopack build fails with TLS error fetching from `https://fonts.googleapis.com/`.

```
Error while requesting resource
There was an issue establishing a connection while requesting https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap
Hint: It looks like this error was TLS-related. Try enabling system TLS certificates with NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 as an environment variable, or set experimental.turbopackUseSystemTlsCerts in your next.config.js file.
```

**Cause:** Environmental — either no network access to `fonts.googleapis.com` from the build host, or a system TLS cert chain issue Turbopack doesn't pick up by default. Not introduced by 21-01 changes.

**Why deferred:**
- Out of scope for 21-01 (the plan's required verification was `tsc --noEmit` + scoped ESLint + i18n parity, all passing).
- Affects every Next.js 16 build on this machine, not just the admin clients page.
- The error message itself suggests a one-line fix in `next.config.ts` (`experimental.turbopackUseSystemTlsCerts: true`) OR an env var; neither is the right call for a list-page plan to introduce.

**Recommended next step:**
- Try `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build` in the dev environment.
- If that resolves it, codify as `experimental.turbopackUseSystemTlsCerts: true` in `next.config.ts` as a separate small commit.
- Alternatively, switch to a self-hosted font asset (eliminates the network dependency at build time entirely).

**Plan-21-01 verification status:** All in-plan automated verifications pass (`tsc --noEmit`, scoped ESLint on `src/app/(admin)/admin/clients/page.tsx` + `src/components/admin/clients/`, i18n parity script). The Google Fonts failure is a pre-existing environmental issue and is logged here for a separate cleanup commit.
