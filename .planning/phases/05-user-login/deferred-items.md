# Deferred Items — Phase 05 User Login

## Out-of-scope discoveries logged during plan execution

---

### 1. middleware.ts → proxy.ts entry-point rename

**Discovered during:** 05-02, Task 2 (build verification)
**Issue:** Next.js 16 deprecates the `middleware` file convention in favor of `proxy`. The file `web/src/middleware.ts` should be renamed to `web/src/proxy.ts`.
**Current impact:** Build warning only — `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` Build succeeds and all routes compile.
**Action needed:** Rename `web/src/middleware.ts` to `web/src/proxy.ts` and update any imports. No logic changes needed.
**Priority:** Low — deprecation warning only, does not block functionality.
