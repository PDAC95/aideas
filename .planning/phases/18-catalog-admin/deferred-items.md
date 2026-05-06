
## Deferred (added 2026-05-07)

### Customer dashboard: connected apps icons missing when template is inactive

**Where:** `web/src/app/(dashboard)/dashboard/automations/page.tsx` and the automation card render.

**Symptom:** When a template is deactivated by admin (`is_active=false`), automations referencing it on the customer dashboard lose their connected-apps icons (ZE, SL, GO badges) and other template-derived metadata. The automation itself keeps running per the warn-but-allow decision, but the card looks degraded.

**Root cause:** The customer-side query for "my automations" likely JOINs with `automation_templates` filtered by `is_active=true`, so deactivated templates return null and the card has no apps to render.

**Fix idea:** The "my automations" view should JOIN templates regardless of `is_active`. Only the catalog browse should filter by active. Or: cache template metadata (apps, name, etc.) at provision time on the `automations` row so it survives template deactivation.

**Priority:** Low. Doesn't block Phase 18. Polish for v1.2 closeout or v1.3.
