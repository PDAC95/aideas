-- =============================================================================
-- Phase 27: Scenario Content Seed
-- SEED: functional_areas (8 fixed rows)
-- Purpose: Populate the empty functional_areas table created in Phase 26 with
--          the 8 fixed taxonomy rows that the public funnel (Phases 29/30) needs
--          present and active so SSR catalog pages render. These 8 areas are the
--          stable parent taxonomy used by Plan 27-03 scenarios (FK target via
--          slug lookup) and Plan 27-04 verification.
--
-- Strategy: Idempotent INSERT keyed by the natural slug UNIQUE constraint. Slug
--           is the stable join key — scenarios will resolve functional_area_id
--           via subquery on slug, so we deliberately avoid hardcoding UUIDs.
--           ON CONFLICT (slug) DO UPDATE so re-runs push label/description edits
--           through (DO NOTHING would silently drop edits). Re-running also
--           re-activates any soft-deleted rows (is_active = true) and bumps
--           updated_at so the existing trigger fires.
--
-- Idempotency: Re-applicable in two senses required by SCEN-04:
--   1. `supabase db reset --local` from a clean state populates 8 rows, zero
--      duplicate-key errors.
--   2. Streaming this file's contents into psql against an already-seeded DB
--      produces zero duplicate-key errors and zero net new rows (count stays
--      at 8), while updated_at advances on the affected rows.
--
-- Downstream consumers:
--   - Plan 27-03 (scenarios seed in supabase/seed.sql) — looks up
--     functional_area_id via (SELECT id FROM public.functional_areas WHERE slug = '...').
--   - Plan 27-04 (verification) — asserts 8 active rows and bilingual content.
--   - Phase 29 (public catalog SSR) — renders these labels + descriptions on
--     /catalog area landing pages.
--   - Phase 30 (ROI calculator) — groups scenarios by functional_area for the
--     selector UI.
--
-- Why a migration (not seed.sql): functional_areas have NO FK dependency on
-- automation_templates, so they can safely live in a migration and run BEFORE
-- automation_templates is seeded by seed.sql. Plan 27-03 scenarios, by contrast,
-- FK automation_templates via scenario_templates and so MUST live in seed.sql.
-- =============================================================================

INSERT INTO public.functional_areas
    (slug, label_en, label_es, description_en, description_es, sort_order, is_active)
VALUES
    (
        'ventas',
        'Sales',
        'Ventas',
        'Close more deals and stop losing leads to slow follow-up.',
        'Cierra mas tratos y deja de perder leads por seguimiento lento.',
        10,
        true
    ),
    (
        'marketing',
        'Marketing',
        'Marketing',
        'Run campaigns that actually convert without spending your weekend in a spreadsheet.',
        'Lanza campanas que convierten sin pasar el fin de semana en una hoja de calculo.',
        20,
        true
    ),
    (
        'atencion-al-cliente',
        'Customer Service',
        'Atencion al Cliente',
        'Reply faster, never drop a ticket, and keep customers happy.',
        'Responde mas rapido, no pierdas tickets y manten contentos a tus clientes.',
        30,
        true
    ),
    (
        'documentos',
        'Documents',
        'Documentos',
        'Stop copy-pasting between forms, contracts, and invoices.',
        'Deja de copiar y pegar entre formularios, contratos y facturas.',
        40,
        true
    ),
    (
        'productividad',
        'Productivity',
        'Productividad',
        'Free your team from manual busy-work so they can do real work.',
        'Libera a tu equipo del trabajo manual repetitivo para que haga el trabajo importante.',
        50,
        true
    ),
    (
        'reportes',
        'Reports',
        'Reportes',
        'Get the numbers you actually need without rebuilding the same report every week.',
        'Obten los numeros que necesitas sin reconstruir el mismo reporte cada semana.',
        60,
        true
    ),
    (
        'agentes-ia',
        'AI Agents',
        'Agentes IA',
        'Put AI to work answering questions, drafting replies, and routing requests.',
        'Pon a la IA a trabajar respondiendo preguntas, redactando respuestas y enrutando solicitudes.',
        70,
        true
    ),
    (
        'integraciones-seguridad',
        'Integrations & Security',
        'Integraciones y Seguridad',
        'Connect your tools and keep your data safe across them.',
        'Conecta tus herramientas y manten tus datos seguros entre ellas.',
        80,
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    label_en       = EXCLUDED.label_en,
    label_es       = EXCLUDED.label_es,
    description_en = EXCLUDED.description_en,
    description_es = EXCLUDED.description_es,
    sort_order     = EXCLUDED.sort_order,
    is_active      = true,
    updated_at     = NOW();

-- =============================================================================
-- End of functional_areas seed migration
-- After apply: SELECT count(*) FROM public.functional_areas WHERE is_active = true;  -- expect 8
-- =============================================================================
