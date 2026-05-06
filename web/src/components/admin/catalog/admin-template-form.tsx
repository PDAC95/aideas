"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  type FieldErrors,
  type Resolver,
  type ResolverResult,
} from "react-hook-form";
import { Loader2, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_CATALOG_CATEGORIES,
  ADMIN_CATALOG_INDUSTRIES,
  ADMIN_CATALOG_PRICING_TIERS,
  adminCatalogTemplateActiveSchema,
  adminCatalogTemplateBaseSchema,
  type AdminCatalogTemplateInput,
} from "@/lib/validations/admin-catalog-template";
import {
  createTemplate,
  updateTemplate,
} from "@/lib/actions/admin-catalog";

/**
 * Connected app suggestions surfaced in the multi-select. Operators can still
 * type free-form names and press Enter; this list is just an at-a-glance
 * shortcut for the most common apps already used across seeded templates.
 */
const CONNECTED_APP_SUGGESTIONS = [
  "Slack",
  "HubSpot",
  "Salesforce",
  "Zapier",
  "Notion",
  "Airtable",
  "Stripe",
  "Google Workspace",
  "WhatsApp",
  "Mailchimp",
  "Zoho",
  "Pipedrive",
] as const;

export interface AdminTemplateFormTranslations {
  newTitle: string;
  editTitle: string;
  submitCreate: string;
  submitUpdate: string;
  submitting: string;
  cancel: string;
  sections: {
    basicInfo: string;
    categorization: string;
    pricing: string;
    metrics: string;
    translations: string;
  };
  fields: {
    slug: string;
    slugHelp: string;
    isActive: string;
    isActiveHelp: string;
    isFeatured: string;
    sortOrder: string;
    icon: string;
    iconHelp: string;
    category: string;
    industries: string;
    industriesHelp: string;
    connectedApps: string;
    connectedAppsHelp: string;
    connectedAppsPlaceholder: string;
    pricingTier: string;
    setupPrice: string;
    monthlyPrice: string;
    setupTimeDays: string;
    avgMinutesPerTask: string;
    nameEn: string;
    nameEs: string;
    descriptionEn: string;
    descriptionEs: string;
    impactEn: string;
    impactEs: string;
    metricLabelEn: string;
    metricLabelEs: string;
  };
  errors: {
    required_when_active: string;
    invalid_slug: string;
    slug_taken: string;
    pick_at_least_one: string;
    create_failed: string;
    update_failed: string;
    not_found: string;
    not_authenticated: string;
    not_staff: string;
  };
  categories: Record<string, string>;
  industries: Record<string, string>;
  pricingTiers: Record<string, string>;
}

/**
 * Form-layer values. Differs from the Zod schema in two ways:
 * - `setup_price_dollars` / `monthly_price_dollars` so the input shows USD;
 *   we convert to cents on submit.
 * - Numeric fields are kept as strings/empty string in the form to handle
 *   "blank" naturally; we coerce on submit.
 *
 * Exported as a type-only helper so the page components can build initial
 * values that match.
 */
export interface AdminTemplateFormValues {
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  icon: string;
  category: (typeof ADMIN_CATALOG_CATEGORIES)[number];
  industry_tags: string[];
  connected_apps: string[];
  pricing_tier: (typeof ADMIN_CATALOG_PRICING_TIERS)[number];
  setup_price_dollars: string;
  monthly_price_dollars: string;
  setup_time_days: string;
  avg_minutes_per_task: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  typical_impact_text_en: string;
  typical_impact_text_es: string;
  activity_metric_label_en: string;
  activity_metric_label_es: string;
}

interface AdminTemplateFormProps {
  mode: "create" | "edit";
  initialValues: AdminTemplateFormValues;
  initialSlugLocked: boolean;
  initialSlug: string;
  translations: AdminTemplateFormTranslations;
}

/**
 * Slugify an EN name for auto-generation. Lowercase, NFKD-normalize to strip
 * accents, replace non-alphanumeric runs with a single hyphen, trim leading
 * and trailing hyphens, cap at 100 chars (matching the DB constraint).
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Convert a USD-dollar form value to integer cents. Empty string maps to null
 * (draft mode allows missing prices). NaN or negative inputs map to null too;
 * Zod's active-mode refinement will surface the missing-value error.
 */
function dollarsToCents(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

/**
 * Convert a string-form numeric field (setup_time_days, avg_minutes_per_task)
 * to int. Empty -> null. Non-int -> null (Zod will catch it).
 */
function strToInt(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  return Math.trunc(num);
}

/**
 * Map the form values to the AdminCatalogTemplateInput Zod input shape.
 * Used both at submit time (with form data) and inside the resolver so the
 * Zod schema can validate the same shape it sees on the server.
 */
function formToZodInput(v: AdminTemplateFormValues): AdminCatalogTemplateInput {
  return {
    slug: v.slug,
    is_active: v.is_active,
    is_featured: v.is_featured,
    sort_order: v.sort_order,
    name_en: v.name_en,
    name_es: v.name_es,
    description_en: v.description_en,
    description_es: v.description_es,
    typical_impact_text_en: v.typical_impact_text_en,
    typical_impact_text_es: v.typical_impact_text_es,
    activity_metric_label_en: v.activity_metric_label_en,
    activity_metric_label_es: v.activity_metric_label_es,
    category: v.category,
    industry_tags: v.industry_tags as AdminCatalogTemplateInput["industry_tags"],
    connected_apps: v.connected_apps,
    pricing_tier: v.pricing_tier,
    setup_price: dollarsToCents(v.setup_price_dollars),
    monthly_price: dollarsToCents(v.monthly_price_dollars),
    setup_time_days: strToInt(v.setup_time_days),
    avg_minutes_per_task: strToInt(v.avg_minutes_per_task),
    icon: v.icon.trim() === "" ? null : v.icon.trim(),
  };
}

/**
 * Custom RHF resolver that bridges form values (USD/string numerics) to the
 * Zod schema (cents/integers). Schema is selected dynamically based on the
 * current `is_active` value so draft saves bypass activation-required checks.
 *
 * Errors are mapped back onto form-field paths (only setup_price_dollars and
 * monthly_price_dollars need a rename; everything else is 1:1).
 */
const adminTemplateResolver: Resolver<AdminTemplateFormValues> = async (
  values
): Promise<ResolverResult<AdminTemplateFormValues>> => {
  const zodInput = formToZodInput(values);
  const schema = values.is_active
    ? adminCatalogTemplateActiveSchema
    : adminCatalogTemplateBaseSchema;
  const parsed = schema.safeParse(zodInput);
  if (parsed.success) {
    return { values, errors: {} };
  }
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of parsed.error.issues) {
    const path = issue.path[0]?.toString();
    if (!path) continue;
    let formField: string = path;
    if (path === "setup_price") formField = "setup_price_dollars";
    if (path === "monthly_price") formField = "monthly_price_dollars";
    if (!(formField in errors)) {
      errors[formField] = { type: "validate", message: issue.message };
    }
  }
  return {
    values: {},
    errors: errors as FieldErrors<AdminTemplateFormValues>,
  };
};

/**
 * Top-level error banner string for a server-action error code.
 */
function topLevelErrorFor(
  errorCode: string | null,
  translations: AdminTemplateFormTranslations
): string | null {
  if (!errorCode) return null;
  switch (errorCode) {
    case "create_failed":
      return translations.errors.create_failed;
    case "update_failed":
      return translations.errors.update_failed;
    case "not_found":
      return translations.errors.not_found;
    case "not_authenticated":
      return translations.errors.not_authenticated;
    case "not_staff":
      return translations.errors.not_staff;
    case "slug_taken":
      return translations.errors.slug_taken;
    default:
      return errorCode;
  }
}

/**
 * Resolve a field-level error message via the translations bundle. Falls back
 * to the raw message string when no key is matched (e.g. native Zod messages).
 */
function fieldErrorMessage(
  message: string | undefined,
  translations: AdminTemplateFormTranslations
): string | undefined {
  if (!message) return undefined;
  switch (message) {
    case "required_when_active":
      return translations.errors.required_when_active;
    case "invalid_slug":
      return translations.errors.invalid_slug;
    case "pick_at_least_one":
      return translations.errors.pick_at_least_one;
    case "slug_taken":
      return translations.errors.slug_taken;
    default:
      return message;
  }
}

export function AdminTemplateForm({
  mode,
  initialValues,
  initialSlugLocked,
  initialSlug,
  translations,
}: AdminTemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topLevelError, setTopLevelError] = useState<string | null>(null);
  const slugManuallyEdited = useRef<boolean>(initialSlugLocked || mode === "edit");

  const form = useForm<AdminTemplateFormValues>({
    defaultValues: initialValues,
    mode: "onSubmit",
    resolver: adminTemplateResolver,
  });
  const { register, handleSubmit, watch, setValue, setError, formState, getValues } = form;

  const isActive = watch("is_active");
  const nameEn = watch("name_en");
  const slug = watch("slug");
  const industries = watch("industry_tags");
  const connectedApps = watch("connected_apps");

  // Auto-generate slug on name_en change (only on create mode while user
  // hasn't manually touched the slug field).
  useEffect(() => {
    if (slugManuallyEdited.current) return;
    const next = slugify(nameEn || "");
    if (next !== slug) {
      setValue("slug", next, { shouldDirty: true, shouldValidate: false });
    }
  }, [nameEn, slug, setValue]);

  // Re-validate on is_active toggle so existing errors update.
  useEffect(() => {
    if (formState.isSubmitted) {
      void form.trigger();
    }
  }, [isActive, form, formState.isSubmitted]);

  const handleSlugChange = (value: string) => {
    slugManuallyEdited.current = true;
    setValue("slug", value, { shouldDirty: true, shouldValidate: false });
  };

  const toggleIndustry = useCallback(
    (industry: string) => {
      const current = getValues("industry_tags");
      const next = current.includes(industry)
        ? current.filter((i) => i !== industry)
        : [...current, industry];
      setValue("industry_tags", next, { shouldDirty: true, shouldValidate: false });
    },
    [getValues, setValue]
  );

  const [appInput, setAppInput] = useState("");
  const handleAddApp = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") return;
      const current = getValues("connected_apps");
      if (current.includes(trimmed)) {
        setAppInput("");
        return;
      }
      setValue("connected_apps", [...current, trimmed], {
        shouldDirty: true,
        shouldValidate: false,
      });
      setAppInput("");
    },
    [getValues, setValue]
  );

  const handleRemoveApp = useCallback(
    (app: string) => {
      const current = getValues("connected_apps");
      setValue(
        "connected_apps",
        current.filter((a) => a !== app),
        { shouldDirty: true, shouldValidate: false }
      );
    },
    [getValues, setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    setTopLevelError(null);
    const zodInput = formToZodInput(data);
    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createTemplate(zodInput);
          if (result.ok) {
            router.push("/admin/catalog");
            router.refresh();
            return;
          }
          if (result.error === "invalid_input" && result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              const formField =
                field === "setup_price"
                  ? "setup_price_dollars"
                  : field === "monthly_price"
                    ? "monthly_price_dollars"
                    : field;
              setError(formField as keyof AdminTemplateFormValues, {
                type: "server",
                message,
              });
            }
            return;
          }
          if (result.error === "slug_taken") {
            setError("slug", {
              type: "server",
              message: "slug_taken",
            });
            setTopLevelError("slug_taken");
            return;
          }
          setTopLevelError(result.error);
        } else {
          const result = await updateTemplate(initialSlug, zodInput);
          if (result.ok) {
            router.push("/admin/catalog");
            router.refresh();
            return;
          }
          if (result.error === "invalid_input" && result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              const formField =
                field === "setup_price"
                  ? "setup_price_dollars"
                  : field === "monthly_price"
                    ? "monthly_price_dollars"
                    : field;
              setError(formField as keyof AdminTemplateFormValues, {
                type: "server",
                message,
              });
            }
            return;
          }
          setTopLevelError(result.error);
        }
      } catch (err) {
        console.error("[AdminTemplateForm] submit_failed", err);
        setTopLevelError(mode === "create" ? "create_failed" : "update_failed");
      }
    });
  });

  const submitting = isPending || formState.isSubmitting;
  const submitLabel = submitting
    ? translations.submitting
    : mode === "create"
      ? translations.submitCreate
      : translations.submitUpdate;

  const errors = formState.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      {topLevelError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-200"
        >
          {topLevelErrorFor(topLevelError, translations)}
        </div>
      )}

      {/* Basic Info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {translations.sections.basicInfo}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="slug">{translations.fields.slug}</Label>
            <div className="relative mt-1">
              <Input
                id="slug"
                value={slug ?? ""}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={initialSlugLocked}
                aria-invalid={!!errors.slug}
                className={cn(
                  "font-mono",
                  initialSlugLocked && "bg-gray-100 dark:bg-gray-800"
                )}
              />
              {initialSlugLocked && (
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {translations.fields.slugHelp}
            </p>
            {errors.slug?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(errors.slug.message, translations)}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 md:col-span-2">
            <input
              id="is_active"
              type="checkbox"
              {...register("is_active")}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <Label htmlFor="is_active" className="cursor-pointer">
                {translations.fields.isActive}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {translations.fields.isActiveHelp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_featured"
              type="checkbox"
              {...register("is_featured")}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              {translations.fields.isFeatured}
            </Label>
          </div>

          <div>
            <Label htmlFor="sort_order">{translations.fields.sortOrder}</Label>
            <Input
              id="sort_order"
              type="number"
              min={0}
              step={1}
              {...register("sort_order", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.sort_order?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(errors.sort_order.message as string, translations)}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="icon">{translations.fields.icon}</Label>
            <Input id="icon" {...register("icon")} className="mt-1" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {translations.fields.iconHelp}
            </p>
          </div>
        </div>
      </section>

      {/* Categorization */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {translations.sections.categorization}
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">{translations.fields.category}</Label>
            <select
              id="category"
              {...register("category")}
              className={cn(
                "mt-1 h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
              )}
            >
              {ADMIN_CATALOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {translations.categories[c] ?? c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>{translations.fields.industries}</Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {translations.fields.industriesHelp}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ADMIN_CATALOG_INDUSTRIES.map((ind) => {
                const selected = industries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/30 dark:text-purple-200"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    {translations.industries[ind] ?? ind}
                  </button>
                );
              })}
            </div>
            {errors.industry_tags?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(errors.industry_tags.message as string, translations)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="connected_apps_input">
              {translations.fields.connectedApps}
            </Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {translations.fields.connectedAppsHelp}
            </p>
            {connectedApps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {connectedApps.map((app) => (
                  <span
                    key={app}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {app}
                    <button
                      type="button"
                      onClick={() => handleRemoveApp(app)}
                      className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                      aria-label={`Remove ${app}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Input
              id="connected_apps_input"
              type="text"
              value={appInput}
              onChange={(e) => setAppInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddApp(appInput);
                }
              }}
              placeholder={translations.fields.connectedAppsPlaceholder}
              className="mt-2"
              list="connected-apps-suggestions"
            />
            <datalist id="connected-apps-suggestions">
              {CONNECTED_APP_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {translations.sections.pricing}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="pricing_tier">{translations.fields.pricingTier}</Label>
            <select
              id="pricing_tier"
              {...register("pricing_tier")}
              className={cn(
                "mt-1 h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
              )}
            >
              {ADMIN_CATALOG_PRICING_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {translations.pricingTiers[tier] ?? tier}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="setup_price_dollars">
              {translations.fields.setupPrice}
            </Label>
            <Input
              id="setup_price_dollars"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              {...register("setup_price_dollars")}
              className="mt-1"
            />
            {errors.setup_price_dollars?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(
                  errors.setup_price_dollars.message as string,
                  translations
                )}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="monthly_price_dollars">
              {translations.fields.monthlyPrice}
            </Label>
            <Input
              id="monthly_price_dollars"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              {...register("monthly_price_dollars")}
              className="mt-1"
            />
            {errors.monthly_price_dollars?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(
                  errors.monthly_price_dollars.message as string,
                  translations
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {translations.sections.metrics}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="setup_time_days">
              {translations.fields.setupTimeDays}
            </Label>
            <Input
              id="setup_time_days"
              type="number"
              min={1}
              max={30}
              step={1}
              inputMode="numeric"
              {...register("setup_time_days")}
              className="mt-1"
            />
            {errors.setup_time_days?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(
                  errors.setup_time_days.message as string,
                  translations
                )}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="avg_minutes_per_task">
              {translations.fields.avgMinutesPerTask}
            </Label>
            <Input
              id="avg_minutes_per_task"
              type="number"
              min={1}
              max={480}
              step={1}
              inputMode="numeric"
              {...register("avg_minutes_per_task")}
              className="mt-1"
            />
            {errors.avg_minutes_per_task?.message && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrorMessage(
                  errors.avg_minutes_per_task.message as string,
                  translations
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Translations */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {translations.sections.translations}
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name_en">{translations.fields.nameEn}</Label>
              <Input id="name_en" {...register("name_en")} className="mt-1" />
              {errors.name_en?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(errors.name_en.message as string, translations)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="name_es">{translations.fields.nameEs}</Label>
              <Input id="name_es" {...register("name_es")} className="mt-1" />
              {errors.name_es?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(errors.name_es.message as string, translations)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="description_en">{translations.fields.descriptionEn}</Label>
              <textarea
                id="description_en"
                {...register("description_en")}
                rows={3}
                className={cn(
                  "mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
                )}
              />
              {errors.description_en?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.description_en.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description_es">{translations.fields.descriptionEs}</Label>
              <textarea
                id="description_es"
                {...register("description_es")}
                rows={3}
                className={cn(
                  "mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
                )}
              />
              {errors.description_es?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.description_es.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="typical_impact_text_en">
                {translations.fields.impactEn}
              </Label>
              <textarea
                id="typical_impact_text_en"
                {...register("typical_impact_text_en")}
                rows={2}
                className={cn(
                  "mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
                )}
              />
              {errors.typical_impact_text_en?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.typical_impact_text_en.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="typical_impact_text_es">
                {translations.fields.impactEs}
              </Label>
              <textarea
                id="typical_impact_text_es"
                {...register("typical_impact_text_es")}
                rows={2}
                className={cn(
                  "mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-input/30 dark:text-white"
                )}
              />
              {errors.typical_impact_text_es?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.typical_impact_text_es.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="activity_metric_label_en">
                {translations.fields.metricLabelEn}
              </Label>
              <Input
                id="activity_metric_label_en"
                {...register("activity_metric_label_en")}
                className="mt-1"
              />
              {errors.activity_metric_label_en?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.activity_metric_label_en.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="activity_metric_label_es">
                {translations.fields.metricLabelEs}
              </Label>
              <Input
                id="activity_metric_label_es"
                {...register("activity_metric_label_es")}
                className="mt-1"
              />
              {errors.activity_metric_label_es?.message && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrorMessage(
                    errors.activity_metric_label_es.message as string,
                    translations
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Submit row */}
      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/catalog")}
          disabled={submitting}
        >
          {translations.cancel}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
