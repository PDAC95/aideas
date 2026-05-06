# Phase 18: Catalog Admin - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Operations team can manage the `automation_templates` catalog through `/admin/catalog` UI instead of editing `seed.sql`. Includes: list with filters/search, create form, edit form, inline `is_active`/`is_featured` toggles, and bilingual text management. Out of scope: deleting templates (hard or soft), versioning of edits, featured-count limits, request flow (Phase 19), or admin permissions beyond what Phase 17 already provides.

</domain>

<decisions>
## Implementation Decisions

### List view
- **Hybrid layout**: dense table by default with a toggle to switch to grid view. Operations defaults to table for speed; grid available for visual review.
- **Search + filters together**: text search on name/slug + dropdown filters for category and industry.
- **Inline toggles, no confirmation**: `is_active` and `is_featured` are switches in the table, click and apply immediately. Optimistic update; on failure revert and show inline error.
- **Intermediate column set** (8 columns): Name, Slug, Category, Industries, Setup price, Monthly price, Active, Featured. No horizontal scroll, all decision-making fields visible.

### Create/edit form
- **Dedicated pages**: `/admin/catalog/new` and `/admin/catalog/[slug]/edit`. Deep-linkable, plenty of space for ~13 fields and bilingual inputs.
- **Single page with grouped sections**: not a wizard, not tabs. Visual grouping: Basic Info, Categorization, Pricing, Metrics, Translations. One submit button at the bottom.
- **`industries[]` as chips toggle**: all 6 industries rendered as togglable chips (matches customer catalog pattern).
- **`connected_apps[]` as multi-select dropdown**: list grows over time, dropdown handles scale better than chips.
- **Strict validation with draft mode**: `is_active=false` allows missing required fields (save partial work). Activating (`is_active=true`) enforces all required fields via Zod refinement. Inline errors on blur and on submit.

### Slug & i18n keys
- **Auto-generated slug from name, editable before first save, locked after**. Changing slug post-creation would break i18n keys and links.
- **Operator fills bilingual text directly in the form** — 8 inputs total: name (EN/ES), description (EN/ES), typical_impact_text (EN/ES), activity_metric_label (EN/ES). System persists translations.
- **Translations stored in a new DB table `automation_template_translations`** with shape `(template_id, locale, field, value, updated_at)` (PK on `template_id, locale, field`). Customer-facing dashboard reads from this table, not from `messages/en.json` / `es.json`.
- **Update directly on edit**: changes persist immediately, customer sees them on next page load. No versioning, no edit lock.

### Toggles `is_active` / `is_featured`
- **No limit on featured count**. Customer "Mas populares" tab orders by `is_featured DESC, created_at DESC` and renders whatever is marked. No UI cap to enforce.
- **Deactivating a template with active automations: warn-but-allow modal**. If `automations` rows exist with this `template_id` and status in `('active', 'in_setup', 'paused', 'pending_review')`, show "Este template tiene N automations activas. Se ocultará del catálogo cliente; las automations existentes seguirán funcionando. ¿Continuar?". Confirm proceeds.
- **No delete** — neither hard nor soft. Templates are deactivated only. The `is_active` flag is the lifecycle control; FKs in `automations` remain valid forever.
- **Optimistic update silently** for inline toggles. No toast on success, switch flips immediately. On failure, revert switch and show inline error message under the row or in the cell.

### Claude's Discretion
- Exact form field layout within each grouped section
- Loading/saving spinner style during form submit
- Empty-state copy when no templates exist (unlikely — catalog ships seeded with 66+)
- Error toast styling and placement
- Confirmation modal styling for deactivation warning
- Whether the grid view in admin shows the same `CatalogCard` as customer or a slimmer admin variant
- How to surface the "draft" state visually in the list (e.g., `is_active=false` with missing required fields)

</decisions>

<specifics>
## Specific Ideas

- The customer catalog at `/dashboard/catalog` already uses chips for the 6 industries — admin form should match the same pattern for consistency.
- Admin is for speed: avoid friction (no extra confirms, no toasts on every toggle).
- The new `automation_template_translations` table is necessary because Next.js bundles `messages/*.json` at build time — admin edits at runtime would otherwise need a redeploy.
- The customer-facing rendering of `template.activity_metric_label` already resolves i18n keys server-side (Phase 9 fix). When migrating to the new translations table, that resolution layer changes from `getTranslations("templates")` lookup to a JOIN against `automation_template_translations`.

</specifics>

<deferred>
## Deferred Ideas

- **Versioning / audit log of template edits** — useful but not v1.2, would be its own phase if we want rollback or change history.
- **Bulk operations** (e.g., toggle 10 templates active at once) — defer; current scale doesn't justify it.
- **Template duplication** ("create new from existing") — common admin pattern but not in current requirements; add to backlog if Operations asks for it.
- **Featured-count limit / quota** — explicitly rejected; revisit only if catalog ordering breaks visually.
- **Hard or soft delete** — explicitly rejected for v1.2; revisit if data hygiene becomes an issue.
- **Image/media upload for templates** (template thumbnails or screenshots) — not in scope; current catalog shows only text + connected app badges.

</deferred>

---

*Phase: 18-catalog-admin*
*Context gathered: 2026-05-06*
