# Deferred Items - Phase 18 Catalog Admin

Items discovered during execution that are out of scope for the current plan and will be addressed later.

## 18-01 (Translations Plane)

### Pre-existing data corruption in `supabase/seed.sql`

Found while verifying the 528 backfill row count: a number of `features[]`, `use_cases[]`, and `automation_requests` body strings in `seed.sql` contain `a0` where the original word should start with `au` (e.g., `'a0to-pause on reply'`, `'a0tomate vendor payments'`, `'a0to-generate ...'`). Pattern looks like a corrupted find-replace that turned every `au` prefix into `a0` in some — but not all — string literals.

**In-scope fix (applied in 18-01):** the two corrupted `slug` values (`'a0dience-segmentation'` -> `'audience-segmentation'` and `'a0to-response-email'` -> `'auto-response-email'`) were fixed because they prevented the backfill from matching template rows by slug, blocking the 528-row verification. These were also broken at the URL level (the customer detail page would have been served at `/dashboard/catalog/a0to-response-email`).

**Deferred:** ~25 remaining `a0` strings in `features[]`, `use_cases[]`, automation custom_description and chat message bodies. Customer-visible only as faint copy issues (the catalog list page does not render `features` / `use_cases`). Triage:
- `seed.sql` lines: 280, 322, 436, 479, 564, 565, 637, 650, 651, 707, 721, 750, 765, 778, 793, 821, 864, 879, 893, 935, 1006, 1020, 1092, 1120, 1176, 1243, 1253, 1304, 1630.
- Single-line text replacement; no logic to verify, no FKs touched. Should be a 5 minute cleanup commit, but separate from any phase-18 plan because it touches lines all over `seed.sql` and would clutter the 18-01 diff.

Recommended action: open a small `chore(seed): fix a0 -> au typos` commit before the next milestone wraps, ideally bundled with any other seed.sql hygiene.
