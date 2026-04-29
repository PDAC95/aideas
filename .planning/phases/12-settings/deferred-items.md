# Phase 12 Deferred Items

Items discovered during execution that fall OUTSIDE the scope of the current plan and were not auto-fixed per CLAUDE.md scope boundary rules.

---

## Build Failure: `next/dynamic { ssr: false }` in Server Component

**Discovered during:** Plan 12-04 verification (`npm run build`)
**File:** `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx:16`
**Origin Phase:** Phase 9 (My Automations)

### Issue

Next.js 16 / Turbopack rejects this pattern:

```ts
const WeeklyBarChart = dynamic(
  () => import("@/components/dashboard/weekly-bar-chart").then((mod) => ({
    default: mod.WeeklyBarChart,
  })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
    ),
  }
);
```

Error message:

> `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component.

### Why deferred

- File belongs to Phase 9, NOT Phase 12 / Plan 12-04 (which only modifies `settings.ts` and `dashboard-header.tsx`).
- Per CLAUDE.md scope boundary: "Only auto-fix issues DIRECTLY caused by the current task's changes. Pre-existing warnings, linting errors, or failures in unrelated files are out of scope."
- Plan 12-04 server actions and dashboard header pass `tsc --noEmit` cleanly.

### Recommended fix (future plan)

Wrap `WeeklyBarChart` import in a thin client component (e.g., `weekly-bar-chart-loader.tsx`, mirroring the pattern already established for `reports-weekly-chart-loader.tsx` in Phase 11) and consume that loader from the RSC `page.tsx`. The dashboard reports route already has the same pattern fixed (`web/src/components/dashboard/reports-weekly-chart-loader.tsx`).

### Status

- [ ] Open — needs new plan / quick task to migrate the chart loader pattern to the automation detail page.
