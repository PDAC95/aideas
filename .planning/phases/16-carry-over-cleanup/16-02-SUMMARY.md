---
phase: 16-carry-over-cleanup
plan: 02
status: complete
completed: 2026-05-04
requirements_completed:
  - CARRY-03
files_modified:
  - web/src/lib/actions/settings.ts
commits:
  - f9cec9e refactor(16-02): consolidate org-membership check via assertOrgMembership
one_liner: "Replaced inline org-membership/role checks in `saveCompanyName` and `saveHourlyCost` with the shared `assertOrgMembership` helper."
---

# 16-02 Summary — Consolidate `assertOrgMembership`

## What was done

CARRY-03 from the v1.1 audit is closed.

`saveCompanyName` and `saveHourlyCost` server actions in [web/src/lib/actions/settings.ts](web/src/lib/actions/settings.ts) previously had their own inline `organization_members` SELECT + role check (which had drifted — they lacked the `is_active=true` filter that the helper applies). Both now delegate to `assertOrgMembership(supabase, orgId, ['owner', 'admin'])`, the same helper introduced in Phase 14-01.

Single source of truth for membership checks across the app.

## Verification

```
grep -n "assertOrgMembership\|organization_members" web/src/lib/actions/settings.ts
```

Output:
- Line 5: `import { assertOrgMembership } from '@/lib/auth/assert-org-membership'`
- Line 71: `const denied = await assertOrgMembership(supabase, orgId, ['owner', 'admin'])`
- Line 143: `const denied = await assertOrgMembership(supabase, orgId, ['owner', 'admin'])`

No inline `organization_members` SELECT blocks remain in this file.

## Notes

No behavior change — the helper applies the same role check plus the `is_active=true` filter the inline version was missing (a small security hardening as a side effect, not a behavior regression).
