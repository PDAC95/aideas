-- =============================================================================
-- Automation Template Translations Migration
-- Phase 18-01: runtime translations for automation_templates so admin catalog
--              edits propagate without redeploy.
--
-- Purpose: Next.js bundles messages/*.json at build time, so an admin edit at
--          runtime would otherwise need a full redeploy to surface on the
--          customer side. This migration adds the (template_id, locale, field)
--          translation table that the customer catalog reads at request time,
--          and backfills it from the existing en.json / es.json content so the
--          rendered output is unchanged on day one.
--
-- Idempotency: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS before each
--              CREATE POLICY, and INSERT ... ON CONFLICT DO NOTHING for the
--              backfill. Re-running the migration is a safe no-op.
--
-- Backfill: 66 templates x 4 fields x 2 locales = 528 rows expected after a
--           clean db reset (with seed.sql applied). The DO block below was
--           emitted programmatically from web/messages/{en,es}.json after a
--           pre-emission parity check. JSON field names map to the field enum:
--             name          -> name
--             description   -> description
--             impact        -> typical_impact_text
--             metric_label  -> activity_metric_label
--           Slug mapping: en.json keys are snake_case; the
--           automation_templates.slug column stores hyphenated slugs, so we
--           match via REPLACE('_','-').
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section 1: automation_template_translations table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.automation_template_translations (
    template_id UUID NOT NULL REFERENCES public.automation_templates(id) ON DELETE CASCADE,
    locale      TEXT NOT NULL CHECK (locale IN ('en','es')),
    field       TEXT NOT NULL CHECK (field IN ('name','description','typical_impact_text','activity_metric_label')),
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (template_id, locale, field)
);

CREATE INDEX IF NOT EXISTS idx_attt_template_locale
    ON public.automation_template_translations (template_id, locale);

ALTER TABLE public.automation_template_translations ENABLE ROW LEVEL SECURITY;

-- Reuse the generic updated_at trigger from 20260305000001_core_identity.sql
DROP TRIGGER IF EXISTS attt_updated_at ON public.automation_template_translations;
CREATE TRIGGER attt_updated_at
    BEFORE UPDATE ON public.automation_template_translations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Section 2: RLS policies
-- ---------------------------------------------------------------------------
-- The catalog is global (any signed-in user can read templates), so we mirror
-- that posture for translations: all authenticated users read, only platform
-- staff write. Mutable-table 4-policy pattern (no FOR ALL) for clearer audit.

-- SELECT: any authenticated user (catalog is global, not org-scoped)
DROP POLICY IF EXISTS "attt_select_authenticated" ON public.automation_template_translations;
CREATE POLICY "attt_select_authenticated"
    ON public.automation_template_translations
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: platform_staff only (Phase 17 helper)
DROP POLICY IF EXISTS "attt_admin_insert" ON public.automation_template_translations;
CREATE POLICY "attt_admin_insert"
    ON public.automation_template_translations
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

-- UPDATE: platform_staff only
DROP POLICY IF EXISTS "attt_admin_update" ON public.automation_template_translations;
CREATE POLICY "attt_admin_update"
    ON public.automation_template_translations
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())))
    WITH CHECK (public.is_platform_staff((SELECT auth.uid())));

-- DELETE: platform_staff only
DROP POLICY IF EXISTS "attt_admin_delete" ON public.automation_template_translations;
CREATE POLICY "attt_admin_delete"
    ON public.automation_template_translations
    FOR DELETE
    TO authenticated
    USING (public.is_platform_staff((SELECT auth.uid())));

-- Note: there is also an admin SELECT path via the 'true' policy above; the
-- admin SELECT is therefore covered without a dedicated attt_admin_select.

-- ---------------------------------------------------------------------------
-- Section 3: Backfill from web/messages/{en,es}.json
-- ---------------------------------------------------------------------------
-- Generated programmatically on plan execution. Counts:
--   66 templates x 4 fields x 2 locales = 528 expected rows
-- ON CONFLICT DO NOTHING makes this idempotent; rerunning the migration after
-- additional INSERTs (or after admin edits at runtime) will not stomp data.
-- If automation_templates is empty (fresh db without seed), the SELECT-based
-- inserts simply find no rows and the block noops without error.

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- 528 INSERT statements emitted below
    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Lead Follow-up Email Sequence'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically nurture leads with personalized email sequences triggered by form submissions, ensuring no prospect falls through the cracks.'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces lead response time from hours to minutes, increasing conversions by up to 35%'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Emails sent'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Secuencia de Seguimiento a Prospectos'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Nutre a tus prospectos automáticamente con secuencias de correo personalizadas activadas por formularios, asegurando que ninguna oportunidad se pierda.'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de respuesta a prospectos de horas a minutos, aumentando las conversiones hasta un 35%'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Correos enviados'
    FROM public.automation_templates WHERE slug = 'lead-followup-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'CRM Data Sync'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Keep your CRM and other business systems in perfect sync with bi-directional data reconciliation and conflict resolution.'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Eliminates duplicate records and manual data entry, saving 5+ hours per week'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Records synced'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Sincronización de CRM'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Mantén tu CRM y otros sistemas de negocio perfectamente sincronizados con reconciliación de datos bidireccional y resolución de conflictos.'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Elimina registros duplicados y la captura manual de datos, ahorrando más de 5 horas por semana'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Registros sincronizados'
    FROM public.automation_templates WHERE slug = 'crm-data-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Automated Proposal Generator'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Generate professional, branded sales proposals in minutes by pulling client data from your CRM and filling pre-built templates.'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Cuts proposal creation time by 80%, enabling reps to send proposals within the same day'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Proposals generated'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Generador Automático de Propuestas'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera propuestas de venta profesionales y con tu marca en minutos, extrayendo datos del cliente de tu CRM y llenando plantillas prediseñadas.'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de creación de propuestas en un 80%, permitiendo enviarlas el mismo día'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Propuestas generadas'
    FROM public.automation_templates WHERE slug = 'proposal-generator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Instant Quote Builder'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically build accurate price quotes from product catalogs, applying volume discounts and sending reminders before quotes expire.'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces quoting time from hours to minutes and improves quote-to-close rates by 20%'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Quotes created'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Constructor de Cotizaciones'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera cotizaciones precisas automáticamente desde tu catálogo de productos, aplicando descuentos por volumen y enviando recordatorios antes de que venzan.'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de cotización de horas a minutos y mejora las tasas de cierre en un 20%'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Cotizaciones creadas'
    FROM public.automation_templates WHERE slug = 'quote-builder'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Sales Pipeline Alerts'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Get real-time Slack and email alerts when deals change stage, go stale, or require urgent attention from your team.'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Prevents hot deals from going cold, recovering an average of 15% of at-risk opportunities'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Alerts sent'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Alertas de Pipeline de Ventas'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Recibe alertas en tiempo real por Slack y correo cuando los negocios cambien de etapa, se enfríen o requieran atención urgente.'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Previene que los negocios calientes se enfríen, recuperando en promedio un 15% de las oportunidades en riesgo'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Alertas enviadas'
    FROM public.automation_templates WHERE slug = 'pipeline-alerts'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Territory Performance Report'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically generate weekly territory reports showing rep performance, quota attainment, and regional breakdown delivered to managers.'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Saves managers 3+ hours per week on manual reporting and improves coaching conversations'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports delivered'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte de Desempeño Territorial'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera automáticamente reportes semanales de territorio mostrando el desempeño de los vendedores, cumplimiento de cuotas y desglose regional.'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Ahorra a los gerentes más de 3 horas semanales en reportes manuales y mejora las sesiones de coaching'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes entregados'
    FROM public.automation_templates WHERE slug = 'territory-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Win/Loss Analysis'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically analyze closed deals to surface patterns in why you win or lose, with AI-generated insights on competitor performance and stage dropouts.'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves win rates by 10-15% by identifying and addressing the top reasons deals are lost'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Deals analyzed'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Análisis de Negocios Ganados y Perdidos'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Analiza automáticamente los negocios cerrados para identificar patrones de por qué ganas o pierdes, con insights generados por IA sobre competidores.'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora las tasas de cierre entre un 10% y 15% al identificar y abordar las principales razones de pérdida'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Negocios analizados'
    FROM public.automation_templates WHERE slug = 'win-loss-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'AI Sales Forecasting'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Use machine learning to predict revenue with high accuracy, model scenarios, and align your team around a single forecast number.'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves forecast accuracy by up to 40%, enabling better resource planning and fewer surprises'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Forecasts generated'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Pronóstico de Ventas con IA'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Usa aprendizaje automático para predecir ingresos con alta precisión, modelar escenarios y alinear a tu equipo alrededor de un único número de pronóstico.'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora la precisión del pronóstico hasta en un 40%, permitiendo mejor planeación de recursos y menos sorpresas'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Pronósticos generados'
    FROM public.automation_templates WHERE slug = 'sales-forecasting'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'AI Content Generation'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Generate on-brand blog posts, social media content, and email copy at scale using AI tuned to your brand voice and SEO keywords.'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases content output by 5x while maintaining brand consistency and reducing writing time'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Content pieces created'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Generación de Contenido con IA'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera artículos de blog, contenido para redes sociales y textos de email a escala, usando IA entrenada con la voz de tu marca y palabras clave SEO.'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta la producción de contenido 5 veces mientras mantiene la consistencia de marca y reduce el tiempo de redacción'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Piezas de contenido creadas'
    FROM public.automation_templates WHERE slug = 'content-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Social Media Scheduler'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Schedule and publish social media posts across platforms at optimal times, keeping your content calendar full without manual effort.'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Saves 4+ hours per week on scheduling and improves engagement with optimal posting times'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Posts scheduled'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Programador de Redes Sociales'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Programa y publica contenido en redes sociales en los momentos óptimos, manteniendo tu calendario lleno sin esfuerzo manual.'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Ahorra más de 4 horas semanales en programación y mejora el engagement con horarios de publicación óptimos'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Publicaciones programadas'
    FROM public.automation_templates WHERE slug = 'social-scheduler'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Automated Lead Scoring'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically score and prioritize leads based on behavioral signals and demographic data, syncing scores to your CRM in real time.'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases sales team efficiency by 30% by focusing effort on the highest-potential leads'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Leads scored'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Calificación Automática de Prospectos'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Califica y prioriza prospectos automáticamente según señales de comportamiento y datos demográficos, sincronizando puntajes a tu CRM en tiempo real.'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta la eficiencia del equipo de ventas en un 30% al enfocar el esfuerzo en los prospectos de mayor potencial'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Prospectos calificados'
    FROM public.automation_templates WHERE slug = 'lead-scoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Email Campaign Automation'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Build and automate segmented email drip campaigns with personalized messaging that guides prospects from awareness to purchase.'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases email open rates by 25% and conversion rates by up to 40% through personalization'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Emails sent'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Automatización de Campañas de Email'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Diseña y automatiza campañas de email segmentadas con mensajes personalizados que guían a los prospectos desde el conocimiento hasta la compra.'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta las tasas de apertura en un 25% y las tasas de conversión hasta un 40% mediante la personalización'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Correos enviados'
    FROM public.automation_templates WHERE slug = 'email-campaigns'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'SEO Rank Monitoring'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically track keyword rankings, monitor competitor positions, and receive alerts when significant ranking changes occur.'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Catches ranking drops 10x faster than manual checks, minimizing traffic loss from algorithm changes'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Keywords tracked'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Monitoreo de Posicionamiento SEO'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Rastrea automáticamente las posiciones de tus palabras clave, monitorea a la competencia y recibe alertas cuando ocurran cambios significativos en el ranking.'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Detecta caídas de posicionamiento 10 veces más rápido que la revisión manual, minimizando la pérdida de tráfico'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Palabras clave monitoreadas'
    FROM public.automation_templates WHERE slug = 'seo-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Ad Performance Monitor'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Aggregate ad performance data from all platforms, track ROAS and CPA, and receive alerts when campaigns underperform or budgets are at risk.'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces wasted ad spend by 20% through real-time anomaly detection and budget pacing alerts'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Campaigns monitored'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Monitor de Rendimiento Publicitario'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Consolida el rendimiento de anuncios de todas las plataformas, monitorea el ROAS y el CPA, y recibe alertas cuando las campañas no cumplan las metas.'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el gasto publicitario desperdiciado en un 20% mediante la detección de anomalías y alertas de presupuesto en tiempo real'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Campañas monitoreadas'
    FROM public.automation_templates WHERE slug = 'ad-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Audience Segmentation Engine'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically segment your customer base using RFM analysis and behavioral clustering, keeping CRM tags updated in real time.'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases campaign revenue by 25% through hyper-targeted messaging to the right audience segments'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Segments updated'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Motor de Segmentación de Audiencias'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Segmenta tu base de clientes automáticamente usando análisis RFM y agrupación por comportamiento, manteniendo las etiquetas del CRM actualizadas en tiempo real.'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta los ingresos de campañas en un 25% mediante mensajes altamente dirigidos a los segmentos correctos'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Segmentos actualizados'
    FROM public.automation_templates WHERE slug = 'audience-segmentation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Newsletter Automation'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically curate content from your blog and industry sources, personalize subject lines, and send weekly newsletters to engaged subscribers.'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Maintains consistent subscriber engagement while reducing newsletter production time by 70%'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Newsletters sent'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Automatización de Newsletter'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Curada automáticamente de contenido de tu blog y fuentes del sector, personaliza líneas de asunto y envía newsletters semanales a suscriptores activos.'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mantiene el engagement con suscriptores mientras reduce el tiempo de producción del newsletter en un 70%'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Newsletters enviados'
    FROM public.automation_templates WHERE slug = 'newsletter-automation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'AI Customer Support Chatbot'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Deploy an AI chatbot that handles customer inquiries 24/7, understands natural language, and seamlessly escalates to human agents when needed.'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Resolves 60% of support tickets without human intervention, reducing support costs by up to 40%'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Conversations handled'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Chatbot de Atención al Cliente con IA'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Despliega un chatbot con IA que atiende consultas de clientes 24/7, entiende lenguaje natural y escala a agentes humanos cuando es necesario.'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Resuelve el 60% de los tickets sin intervención humana, reduciendo los costos de soporte hasta un 40%'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Conversaciones atendidas'
    FROM public.automation_templates WHERE slug = 'ai-chatbot-24-7'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Auto-Response Email'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically respond to incoming support and inquiry emails with smart categorization and appropriate templated replies.'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces average first response time from hours to under 2 minutes for all inbound emails'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Emails responded'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Respuesta Automática de Correo'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Responde automáticamente los correos de soporte e consultas entrantes con categorización inteligente y respuestas basadas en plantillas.'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo promedio de primera respuesta de horas a menos de 2 minutos para todos los correos entrantes'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Correos respondidos'
    FROM public.automation_templates WHERE slug = 'auto-response-email'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Smart Ticket Routing'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Use AI to classify incoming support tickets by topic and urgency, then automatically route them to the right agent or team.'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces misassigned tickets by 85% and cuts average handle time by 30% through smart routing'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Tickets routed'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Enrutamiento Inteligente de Tickets'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Usa IA para clasificar los tickets de soporte por tema y urgencia, y enrutarlos automáticamente al agente o equipo correcto.'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce los tickets mal asignados en un 85% y el tiempo de manejo promedio en un 30% mediante enrutamiento inteligente'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Tickets enrutados'
    FROM public.automation_templates WHERE slug = 'ticket-routing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Customer Satisfaction Surveys'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically send CSAT and NPS surveys after ticket resolution and alert your team when satisfaction scores drop below thresholds.'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases survey response rates by 3x with automated follow-up, giving you actionable satisfaction data'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Surveys sent'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Encuestas de Satisfacción del Cliente'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Envía encuestas de CSAT y NPS automáticamente tras resolver tickets y alerta al equipo cuando los puntajes caen por debajo de los umbrales.'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta las tasas de respuesta a encuestas 3 veces con seguimiento automatizado, obteniendo datos acciónables de satisfacción'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Encuestas enviadas'
    FROM public.automation_templates WHERE slug = 'satisfaction-surveys'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'SLA Monitoring & Alerts'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Proactively monitor SLA compliance, predict at-risk tickets before they breach, and auto-escalate to senior agents when needed.'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces SLA breach rate by 90% with proactive alerting and automatic escalation workflows'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'SLA checks performed'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Monitoreo y Alertas de SLA'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea proactivamente el cumplimiento de SLAs, predice tickets en riesgo antes de que incumplan y escala automáticamente cuando es necesario.'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce la tasa de incumplimiento de SLA en un 90% con alertas proactivas y flujos de escalación automática'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Verificaciones de SLA realizadas'
    FROM public.automation_templates WHERE slug = 'sla-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Knowledge Base Updater'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Detect recurring support questions and automatically draft knowledge base articles for agent review, keeping your help docs current.'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces repetitive ticket volume by 30% within 60 days by keeping self-service content up to date'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Articles updated'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Actualizador de Base de Conocimiento'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Detecta preguntas de soporte recurrentes y genera automáticamente borradores de artículos para revisión, manteniendo la documentación actualizada.'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el volumen de tickets repetitivos en un 30% en 60 días al mantener actualizado el contenido de autoservicio'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Artículos actualizados'
    FROM public.automation_templates WHERE slug = 'knowledge-base-updater'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Escalation Manager'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically identify at-risk customers through sentiment analysis and escalate high-value issues to senior agents or managers instantly.'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces churn from poor service experiences by 25% through proactive VIP customer escalation'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Escalations managed'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Gestor de Escalaciones'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Identifica automáticamente clientes en riesgo mediante análisis de sentimiento y escala problemas de alto valor a agentes senior o gerentes al instante.'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce la pérdida de clientes por malas experiencias de servicio en un 25% mediante escalación proactiva de clientes VIP'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Escalaciones gestionadas'
    FROM public.automation_templates WHERE slug = 'escalation-manager'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'FAQ Bot'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Deploy a lightweight bot that answers frequently asked questions instantly across your website, chat, and messaging channels.'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Deflects 40% of inbound support volume by answering common questions without agent involvement'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'FAQs answered'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Bot de Preguntas Frecuentes'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Despliega un bot ligero que responde preguntas frecuentes al instante en tu sitio web, chat y canales de mensajería.'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Desvía el 40% del volumen de soporte entrante respondiendo preguntas comunes sin intervención de agentes'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Preguntas respondidas'
    FROM public.automation_templates WHERE slug = 'faq-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Review Response Automation'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Monitor online reviews across platforms and automatically draft personalized responses that protect and enhance your brand reputation.'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves average review response time from days to hours, boosting overall rating by 0.3-0.5 stars'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reviews responded'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Automatización de Respuestas a Reseñas'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea reseñas en línea en todas las plataformas y genera automáticamente respuestas personalizadas que protegen la reputación de tu marca.'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora el tiempo de respuesta a reseñas de días a horas, aumentando la calificación general entre 0.3 y 0.5 estrellas'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reseñas respondidas'
    FROM public.automation_templates WHERE slug = 'review-response'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Invoice Processing'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Extract data from vendor invoices using OCR, validate against purchase orders, and post approved invoices directly to your accounting system.'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Processes invoices 10x faster than manual entry, reducing accounts payable processing costs by 60%'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Invoices processed'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Procesamiento de Facturas'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Extrae datos de facturas de proveedores mediante OCR, valida contra órdenes de compra y publica facturas aprobadas directamente en tu sistema contable.'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Procesa facturas 10 veces más rápido que la captura manual, reduciendo los costos de cuentas por pagar en un 60%'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Facturas procesadas'
    FROM public.automation_templates WHERE slug = 'invoice-processing'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Automated Report Generation'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Generate formatted reports from your business data on a schedule and automatically distribute them to the right stakeholders.'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Saves analysts 5+ hours per week on report preparation and ensures stakeholders always have current data'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports generated'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Generación Automática de Reportes'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera reportes formateados con datos de tu negocio de forma programada y distribúyelos automáticamente a los interesados correctos.'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Ahorra a los analistas más de 5 horas semanales en la preparación de reportes y asegura que los datos siempre estén actualizados'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes generados'
    FROM public.automation_templates WHERE slug = 'report-generation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Contract Analysis'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Use AI to extract key clauses, flag non-standard terms, and track obligations across your entire contract portfolio.'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces contract review time by 70% and catches risk clauses that manual review often misses'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Contracts analyzed'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Análisis de Contratos con IA'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Usa IA para extraer cláusulas clave, detectar términos no estándar y rastrear obligaciones en todo tu portafolio de contratos.'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de revisión de contratos en un 70% y detecta cláusulas de riesgo que la revisión manual frecuentemente pasa por alto'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Contratos analizados'
    FROM public.automation_templates WHERE slug = 'contract-analysis'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Document Data Extraction'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically extract structured data from PDFs, spreadsheets, and scanned forms, with validation and error flagging built in.'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Eliminates manual data entry for 90% of incoming documents, reducing errors by 95%'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Documents processed'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Extracción de Datos de Documentos'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Extrae automáticamente datos estructurados de PDFs, hojas de cálculo y formularios escaneados, con validación y detección de errores integrada.'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Elimina la captura manual de datos para el 90% de los documentos entrantes, reduciendo errores en un 95%'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Documentos procesados'
    FROM public.automation_templates WHERE slug = 'data-extraction'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Document Approval Workflow'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Route documents through multi-stage approval workflows with deadline reminders, audit trails, and e-signature integration.'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces document approval cycle time by 50% and ensures full compliance audit trails'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Documents approved'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Flujo de Aprobación de Documentos'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Enruta documentos a través de flujos de aprobación multi-etapa con recordatorios de plazos, registro de auditoría e integración de firma electrónica.'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo del ciclo de aprobación de documentos en un 50% y garantiza registros de auditoría completos'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Documentos aprobados'
    FROM public.automation_templates WHERE slug = 'document-approval'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Document Template Filling'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically populate document templates — contracts, letters, onboarding docs — with data pulled from your CRM or database.'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces document preparation time from 30 minutes to under 2 minutes per document'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Documents generated'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Llenado Automático de Plantillas'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Llena automáticamente plantillas de documentos —contratos, cartas, documentos de incorporación— con datos extraídos de tu CRM o base de datos.'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de preparación de documentos de 30 minutos a menos de 2 minutos por documento'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Documentos generados'
    FROM public.automation_templates WHERE slug = 'template-filling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Receipt Scanning & Expense Tracking'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Capture receipts via mobile photo, automatically categorize expenses, and sync to your accounting system for fast reimbursement.'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Cuts expense report processing time by 75% and reduces errors from manual expense entry'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Receipts processed'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Escaneo de Recibos y Control de Gastos'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Captura recibos con foto desde el celular, categoriza gastos automáticamente y sincroniza con tu sistema contable para reembolsos rápidos.'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de procesamiento de gastos en un 75% y disminuye errores por captura manual'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Recibos procesados'
    FROM public.automation_templates WHERE slug = 'receipt-scanning'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Document Compliance Checker'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically check documents against regulatory requirements, identify compliance gaps, and generate remediation workflows.'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces compliance risk exposure by catching 95% of regulatory gaps before they become audit findings'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Documents reviewed'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Verificador de Cumplimiento Normativo'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Revisa documentos automáticamente contra requisitos regulatorios, identifica brechas de cumplimiento y genera flujos de remediación.'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce la exposición al riesgo regulatorio al detectar el 95% de las brechas antes de que se conviertan en hallazgos de auditoría'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Documentos revisados'
    FROM public.automation_templates WHERE slug = 'compliance-checker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Data Reconciliation'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically compare data across multiple systems to detect discrepancies, apply resolution rules, and generate exception reports.'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces reconciliation time from days to hours and catches 99% of data discrepancies automatically'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Records reconciled'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Conciliación de Datos'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Compara automáticamente datos entre múltiples sistemas para detectar discrepancias, aplicar reglas de resolución y generar reportes de excepciones.'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de conciliación de días a horas y detecta automáticamente el 99% de las discrepancias de datos'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Registros conciliados'
    FROM public.automation_templates WHERE slug = 'data-reconciliation'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Inventory Sync'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Keep inventory levels synchronized across all your sales channels and locations in real time, with automatic reorder point alerts.'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Eliminates overselling and stockouts, improving inventory accuracy to 99%+ across all channels'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'SKUs synced'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Sincronización de Inventario'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Mantén los niveles de inventario sincronizados en todos tus canales de venta y ubicaciones en tiempo real, con alertas automáticas de punto de reorden.'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Elimina las ventas en exceso y las roturas de stock, mejorando la precisión del inventario al 99%+ en todos los canales'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'SKUs sincronizados'
    FROM public.automation_templates WHERE slug = 'inventory-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Automated Shift Scheduling'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Build optimal shift schedules based on staff availability and coverage requirements, with automated notifications and swap handling.'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces scheduling time by 80% and cuts understaffing incidents by 60% through smart coverage planning'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Shifts scheduled'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Programación Automática de Turnos'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera turnos óptimos según la disponibilidad del personal y los requisitos de cobertura, con notificaciones automáticas y manejo de cambios.'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de programación en un 80% y los incidentes de falta de personal en un 60% mediante planeación inteligente'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Turnos programados'
    FROM public.automation_templates WHERE slug = 'shift-scheduling'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Vendor Management Automation'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Track vendor contracts, monitor performance scores, automate payment schedules, and streamline vendor onboarding workflows.'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces vendor management overhead by 50% and prevents costly contract lapses through automated renewal alerts'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Vendors managed'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Automatización de Gestión de Proveedores'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Rastrea contratos con proveedores, monitorea puntajes de desempeño, automatiza calendarios de pago y agiliza los flujos de incorporación de proveedores.'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce la carga administrativa de gestión de proveedores en un 50% y previene costosas caducidades de contrato'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Proveedores gestionados'
    FROM public.automation_templates WHERE slug = 'vendor-management'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Quality Monitoring'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Continuously monitor quality metrics, trigger alerts when thresholds are breached, and automate corrective action workflows.'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces quality-related costs by 30% through early detection and faster corrective action resolution'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Quality checks run'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Monitoreo de Calidad'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea continuamente métricas de calidad, activa alertas cuando se superan los umbrales y automatiza los flujos de acción correctiva.'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce los costos relacionados con calidad en un 30% mediante detección temprana y resolución más rápida de acciónes correctivas'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Verificaciones de calidad realizadas'
    FROM public.automation_templates WHERE slug = 'quality-monitoring'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Workflow Orchestrator'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Design and automate complex multi-step business processes with visual workflow logic, conditional branching, and cross-system triggers.'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Replaces 80% of manual handoffs in complex workflows, reducing process cycle time by up to 60%'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Workflows executed'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Orquestador de Flujos de Trabajo'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Diseña y automatiza procesos de negocio complejos de múltiples pasos con lógica visual, ramificación condicional y disparadores entre sistemas.'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reemplaza el 80% de los traspasos manuales en flujos complejos, reduciendo el tiempo de ciclo de procesos hasta un 60%'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Flujos ejecutados'
    FROM public.automation_templates WHERE slug = 'workflow-orchestrator'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'System Health Monitor'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Monitor uptime, latency, and error rates across your APIs and services, with instant Slack alerts and automatic incident creation.'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces mean time to detection for outages by 10x, minimizing the business impact of downtime'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Health checks run'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Monitor de Salud de Sistemas'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea la disponibilidad, latencia y tasa de errores en tus APIs y servicios, con alertas instantáneas en Slack y creación automática de incidentes.'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo promedio de detección de interrupciones 10 veces, minimizando el impacto de caídas en el negocio'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Verificaciones de salud realizadas'
    FROM public.automation_templates WHERE slug = 'system-health-monitor'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Backup Verification'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically verify that scheduled backups completed successfully, validate data integrity, and alert the team on any failures.'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Ensures 100% backup coverage and catches backup failures before they become data loss events'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Backups verified'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Verificación de Respaldos'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Verifica automáticamente que los respaldos programados se completaron correctamente, valida la integridad de los datos y alerta al equipo ante fallas.'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Garantiza una cobertura de respaldo del 100% y detecta fallas antes de que se conviertan en pérdida de datos'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Respaldos verificados'
    FROM public.automation_templates WHERE slug = 'backup-verification'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'AI Meeting Notes'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically transcribe meetings, extract action items and decisions, and distribute summaries to attendees after every call.'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Saves 30+ minutes per meeting on note-taking and ensures 100% of action items are captured'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Meetings summarized'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Notas de Reuniones con IA'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Transcribe reuniones automáticamente, extrae puntos de acción y decisiones, y distribuye resúmenes a los asistentes después de cada llamada.'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Ahorra más de 30 minutos por reunión en toma de notas y garantiza que el 100% de los puntos de acción queden registrados'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reuniones resumidas'
    FROM public.automation_templates WHERE slug = 'meeting-notes-ai'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Automated Task Assignment'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically create and assign tasks from emails, meetings, or triggers, routing them to the right person based on workload and skills.'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces task setup time by 70% and ensures no action items are dropped or forgotten'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Tasks assigned'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Asignación Automática de Tareas'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Crea y asigna tareas automáticamente a partir de correos, reuniones o disparadores, enrutándolas a la persona correcta según carga de trabajo y habilidades.'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de configuración de tareas en un 70% y asegura que ningún punto de acción se pierda u olvide'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Tareas asignadas'
    FROM public.automation_templates WHERE slug = 'task-assignment'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Time Tracking Sync'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Aggregate time tracking data across projects, calculate billable amounts, generate timesheets, and sync to your billing system.'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Recovers 5-10% of previously unbilled time and cuts timesheet preparation time by 80%'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Hours synced'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Sincronización de Control de Horas'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Agrega datos de control de horas entre proyectos, calcula montos facturables, genera partes de horas y los sincroniza con tu sistema de facturación.'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Recupera entre el 5% y 10% de horas no facturadas anteriormente y reduce el tiempo de preparación de partes de horas en un 80%'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Horas sincronizadas'
    FROM public.automation_templates WHERE slug = 'time-tracking-sync'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Calendar Optimizer'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Protect deep work time, cluster meetings intelligently, enforce buffer times, and optimize your team''s calendars for productivity.'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases uninterrupted work blocks by 40% and reduces context-switching fatigue'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Calendar events optimized'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Optimizador de Calendario'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Protege el tiempo de trabajo profundo, agrupa reuniones de forma inteligente, establece tiempos de amortiguación y optimiza los calendarios del equipo.'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta los bloques de trabajo ininterrumpido en un 40% y reduce la fatiga por cambio de contexto'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Eventos de calendario optimizados'
    FROM public.automation_templates WHERE slug = 'calendar-optimizer'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Slack Channel Digest'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically summarize Slack channels, highlight important threads, and extract action items into a daily or weekly digest.'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces time spent catching up on Slack by 50%, surfacing only what truly needs your attention'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Channels summarized'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Resumen de Canales de Slack'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Resume automáticamente los canales de Slack, destaca hilos importantes y extrae puntos de acción en un resumen diario o semanal.'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de actualización en Slack en un 50%, mostrando solo lo que realmente requiere tu atención'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Canales resumidos'
    FROM public.automation_templates WHERE slug = 'slack-digest'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Project Status Report'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically compile project data from your tools, generate RAG status reports, and deliver them to stakeholders on a schedule.'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Saves project managers 3+ hours per week on status reporting and improves stakeholder visibility'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports delivered'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte de Estado de Proyectos'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Compila automáticamente datos de proyectos de tus herramientas, genera reportes de estado RAG y los entrega a los interesados con puntualidad.'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Ahorra a los gerentes de proyecto más de 3 horas semanales en reportes de estado y mejora la visibilidad de los involucrados'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes entregados'
    FROM public.automation_templates WHERE slug = 'project-status-report'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Daily Standup Bot'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Run async daily standups via Slack, collect team updates, highlight blockers, and deliver a team summary to managers automatically.'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Replaces 30-minute sync standups, saving 2.5+ hours per week per team member'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Standups collected'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Bot de Standup Diario'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Realiza standups diarios de forma asíncrona por Slack, recopila actualizaciones del equipo, resalta bloqueos y entrega un resumen automático a los gerentes.'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reemplaza standups sincrónicos de 30 minutos, ahorrando más de 2.5 horas semanales por miembro del equipo'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Standups recopilados'
    FROM public.automation_templates WHERE slug = 'daily-standup-bot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Resource Planner'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Track team capacity, match skills to project needs, flag overallocations, and report on bench time across your organization.'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves resource utilization by 20% and prevents team burnout through proactive capacity monitoring'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Capacity plans updated'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Planeador de Recursos'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Rastrea la capacidad del equipo, relaciona habilidades con necesidades de proyectos, detecta sobreasignaciones y reporta tiempo disponible en la organización.'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora la utilización de recursos en un 20% y previene el agotamiento del equipo mediante monitoreo proactivo de capacidad'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Planes de capacidad actualizados'
    FROM public.automation_templates WHERE slug = 'resource-planner'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Executive Dashboard'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Aggregate KPIs from all business systems into a single real-time dashboard designed for executive decision-making.'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Eliminates weekly manual reporting packs, giving leadership real-time visibility into company performance'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Dashboards refreshed'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Dashboard Ejecutivo'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Consolida KPIs de todos los sistemas de negocio en un único dashboard en tiempo real diseñado para la toma de decisiones ejecutivas.'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Elimina los reportes manuales semanales para la dirección, dando visibilidad en tiempo real del desempeño de la empresa'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Dashboards actualizados'
    FROM public.automation_templates WHERE slug = 'executive-dashboard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'KPI Tracker'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Monitor key performance indicators against targets, alert owners when goals are at risk, and track trends over time.'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves goal attainment rates by 25% through proactive alerting and accountability tracking'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'KPIs monitored'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Seguimiento de KPIs'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea indicadores clave de desempeño contra objetivos, alerta a los responsables cuando las metas están en riesgo y rastrea tendencias en el tiempo.'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora el cumplimiento de metas en un 25% mediante alertas proactivas y seguimiento de responsabilidades'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'KPIs monitoreados'
    FROM public.automation_templates WHERE slug = 'kpi-tracker'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Financial Summary Report'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically generate P&L, balance sheet, and cash flow summaries with budget-vs-actual comparisons and trend analysis.'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Delivers board-ready financial reports in minutes instead of days, improving financial decision-making speed'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports generated'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte Financiero Resumido'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera automáticamente resúmenes de estado de resultados, balance general y flujo de caja con comparativos presupuesto-real y análisis de tendencias.'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Entrega reportes financieros listos para el consejo en minutos en vez de días, acelerando la toma de decisiones'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes generados'
    FROM public.automation_templates WHERE slug = 'financial-summary'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Client Performance Report'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automatically generate and deliver per-client performance reports with KPIs, SLA compliance, and health scores.'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases client retention by 15% by proactively demonstrating value and catching at-risk accounts early'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Client reports sent'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte de Desempeño por Cliente'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Genera y entrega automáticamente reportes de desempeño por cliente con KPIs, cumplimiento de SLA y puntajes de salud.'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta la retención de clientes en un 15% al demostrar valor proactivamente y detectar cuentas en riesgo a tiempo'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes de clientes enviados'
    FROM public.automation_templates WHERE slug = 'client-performance'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Team Productivity Report'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Measure team output against capacity, track individual contributions, and identify bottlenecks with weekly automated reports.'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves team throughput by 15% by identifying and resolving bottlenecks faster'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Productivity reports sent'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte de Productividad del Equipo'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Mide el rendimiento del equipo contra la capacidad, rastrea contribuciones individuales e identifica cuellos de botella con reportes semanales automáticos.'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora el rendimiento del equipo en un 15% al identificar y resolver cuellos de botella con mayor rapidez'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes de productividad enviados'
    FROM public.automation_templates WHERE slug = 'team-productivity'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Marketing ROI Report'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Aggregate performance data across all marketing channels, calculate ROI and attribution, and deliver insights to optimize spending.'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Improves marketing ROI by 20% by identifying the highest-performing channels and reallocating budget accordingly'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports generated'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Reporte de ROI de Marketing'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Consolida datos de rendimiento de todos los canales de marketing, calcula el ROI y la atribución, y entrega insights para optimizar el gasto.'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mejora el ROI de marketing en un 20% al identificar los canales de mayor rendimiento y reasignar presupuesto en consecuencia'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes generados'
    FROM public.automation_templates WHERE slug = 'marketing-roi'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Operations Scorecard'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Score operational performance across quality, efficiency, and cost metrics, tracking trends and flagging areas needing improvement.'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces operational costs by 10-15% by continuously surfacing inefficiencies and improvement opportunities'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Scorecards generated'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Scorecard de Operaciones'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Evalúa el desempeño operacional en métricas de calidad, eficiencia y costo, rastreando tendencias y señalando áreas que requieren mejora.'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce los costos operacionales entre un 10% y 15% al identificar continuamente ineficiencias y oportunidades de mejora'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Scorecards generados'
    FROM public.automation_templates WHERE slug = 'operations-scorecard'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Custom Analytics Builder'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Build bespoke analytics reports by blending data from multiple sources, with scheduled delivery and a self-serve query interface.'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Replaces weeks of manual spreadsheet analysis with on-demand answers to any business question'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Reports generated'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Constructor de Analítica Personalizada'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Diseña reportes analíticos a la medida combinando datos de múltiples fuentes, con entrega programada e interfaz de consulta de autoservicio.'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reemplaza semanas de análisis manual en hojas de cálculo con respuestas instantáneas a cualquier pregunta de negocio'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes generados'
    FROM public.automation_templates WHERE slug = 'custom-analytics'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Multi-Channel Support Agent'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'An AI agent that unifies support across email, chat, and SMS, classifies intent, resolves common issues autonomously, and hands off to humans seamlessly.'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Handles 70% of support volume autonomously across all channels, reducing support staffing needs by 30%'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Interactions resolved'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente de Soporte Multicanal'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Un agente de IA que unifica el soporte por correo, chat y SMS, clasifica la intención, resuelve problemas comunes de forma autónoma y transfiere a humanos sin interrupciones.'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Gestiona el 70% del volumen de soporte de forma autónoma en todos los canales, reduciendo las necesidades de personal en un 30%'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Interacciónes resueltas'
    FROM public.automation_templates WHERE slug = 'multichannel-support-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Research Assistant Agent'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'An AI agent that conducts structured research on competitors, markets, or topics and delivers organized summaries and briefing documents.'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Completes in 20 minutes what previously took a junior analyst 2 days to research and compile'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Research reports produced'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente Asistente de Investigación'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Un agente de IA que realiza investigaciones estructuradas sobre competidores, mercados o temas, y entrega resúmenes organizados y documentos de briefing.'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Completa en 20 minutos lo que antes tomaba a un analista junior 2 días de investigación y compilación'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes de investigación producidos'
    FROM public.automation_templates WHERE slug = 'research-assistant'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Data Analyst Agent'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Ask business questions in plain language and get instant data analysis, visualizations, and insights generated by an AI analyst.'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Gives every team member analyst-level insights without waiting for the data team, reducing reporting backlogs by 80%'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Analyses generated'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente Analista de Datos'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Haz preguntas de negocio en lenguaje natural y obtén análisis de datos instantáneo, visualizaciones e insights generados por un analista de IA.'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Da a cada miembro del equipo acceso a insights de nivel analista sin esperar al equipo de datos, reduciendo retrasos de reportes en un 80%'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Análisis generados'
    FROM public.automation_templates WHERE slug = 'data-analyst-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Content Strategist Agent'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'An AI agent that analyzes content gaps, ideates topics, manages your editorial calendar, and produces multi-format content at scale.'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Triples content output while reducing strategy and production time by 60%'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Content pieces produced'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente Estratega de Contenido'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Un agente de IA que analiza brechas de contenido, genera ideas de temas, gestiona tu calendario editorial y produce contenido en múltiples formatos a escala.'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Triplica la producción de contenido mientras reduce el tiempo de estrategia y producción en un 60%'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Piezas de contenido producidas'
    FROM public.automation_templates WHERE slug = 'content-strategist-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Sales Copilot Agent'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'An AI copilot that coaches reps on active deals, recommends next best actions, surfaces objection handling prompts, and scores pipeline risk.'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Increases rep win rates by 20% and reduces average sales cycle length by 15% through AI-guided coaching'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Deal recommendations made'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Copiloto de Ventas'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Un copiloto de IA que asesora a los vendedores en negocios activos, recomienda las mejores acciónes, ofrece respuestas a objeciones y evalúa el riesgo del pipeline.'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Aumenta la tasa de cierre de los vendedores en un 20% y reduce el ciclo de ventas promedio en un 15% mediante asesoría guiada por IA'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Recomendaciones de negocio realizadas'
    FROM public.automation_templates WHERE slug = 'sales-copilot'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'HR Onboarding Agent'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Automate the entire new hire onboarding journey — checklists, welcome emails, document collection, and day-1 readiness tracking.'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces HR onboarding admin time by 70% and improves new hire time-to-productivity by 30%'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Onboardings completed'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente de Incorporación de Personal'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Automatiza todo el proceso de incorporación de nuevos empleados — checklists, correos de bienvenida, recopilación de documentos y seguimiento de preparación para el día 1.'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo administrativo de incorporación en RR.HH. en un 70% y mejora el tiempo de productividad de nuevos empleados en un 30%'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Incorporaciones completadas'
    FROM public.automation_templates WHERE slug = 'hr-onboarding-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Code Review Agent'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'An AI agent that analyzes pull requests for security vulnerabilities, code quality issues, and style violations, posting inline review comments.'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Catches 80% of common security and quality issues before human review, cutting PR review time in half'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'PRs reviewed'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente de Revisión de Código'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Un agente de IA que analiza pull requests en busca de vulnerabilidades de seguridad, problemas de calidad de código e infracciónes de estilo, publicando comentarios de revisión en línea.'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Detecta el 80% de los problemas comunes de seguridad y calidad antes de la revisión humana, reduciendo el tiempo de revisión de PRs a la mitad'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'PRs revisados'
    FROM public.automation_templates WHERE slug = 'code-review-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Compliance Agent'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Monitor regulatory changes, check policy documents for gaps, automate audit preparation workflows, and track remediation progress.'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Reduces compliance preparation time by 60% and minimizes regulatory risk through continuous monitoring'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Compliance checks run'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente de Cumplimiento Normativo'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea cambios regulatorios, verifica brechas en documentos de política, automatiza la preparación de auditorías y rastrea el progreso de remediación.'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Reduce el tiempo de preparación de cumplimiento en un 60% y minimiza el riesgo regulatorio mediante monitoreo continuo'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Verificaciones de cumplimiento realizadas'
    FROM public.automation_templates WHERE slug = 'compliance-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'name', 'Competitive Intelligence Agent'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'description', 'Continuously monitor competitors for product launches, pricing changes, and news mentions, delivering weekly intel digests to your team.'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'typical_impact_text', 'Keeps your team 10x better informed on competitive moves, enabling faster strategic responses'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'en', 'activity_metric_label', 'Intel reports delivered'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'name', 'Agente de Inteligencia Competitiva'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'description', 'Monitorea continuamente a la competencia en lanzamientos de productos, cambios de precio y menciones en medios, entregando resúmenes de inteligencia semanales a tu equipo.'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'typical_impact_text', 'Mantiene a tu equipo 10 veces mejor informado sobre los movimientos de la competencia, permitiendo respuestas estratégicas más rápidas'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    INSERT INTO public.automation_template_translations (template_id, locale, field, value)
    SELECT id, 'es', 'activity_metric_label', 'Reportes de inteligencia entregados'
    FROM public.automation_templates WHERE slug = 'competitive-intel-agent'
    ON CONFLICT (template_id, locale, field) DO NOTHING;

    -- Observability
    SELECT COUNT(*) INTO v_count FROM public.automation_template_translations;
    RAISE NOTICE 'automation_template_translations backfill complete: % rows total', v_count;
END
$$;
