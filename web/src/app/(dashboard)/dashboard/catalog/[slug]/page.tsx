import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { fetchTemplateBySlug } from "@/lib/dashboard/queries";
import { CatalogRequestButton } from "./catalog-request-button";

interface CatalogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Deterministic color from a string (hash-based) — mirrors automation-card.tsx
const APP_COLORS = [
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
];

function getAppColor(appName: string): string {
  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = (hash * 31 + appName.charCodeAt(i)) & 0xffff;
  }
  return APP_COLORS[hash % APP_COLORS.length];
}

export default async function CatalogDetailPage({
  params,
}: CatalogDetailPageProps) {
  // Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Read route params (Next.js 15/16 — params is a Promise)
  const { slug } = await params;

  // Fetch template data and translations in parallel
  const [template, t, tTemplates, locale] = await Promise.all([
    fetchTemplateBySlug(slug),
    getTranslations("dashboard.catalog"),
    getTranslations("templates"),
    getLocale(),
  ]);

  if (!template) {
    notFound();
  }

  // Resolve i18n display strings from the template name i18n key
  // template.name is like "templates.lead_followup_email.name"
  // Extract the slug_snake part: "lead_followup_email"
  const nameParts = template.name.split(".");
  // nameParts[0] = "templates", nameParts[1] = slug_snake, nameParts[2] = "name"
  const slugSnake = nameParts.length >= 3 ? nameParts[1] : template.slug.replace(/-/g, "_");

  let displayName: string;
  let displayDescription: string;
  let displayImpact: string;

  try {
    displayName = tTemplates(`${slugSnake}.name`);
  } catch {
    displayName = template.name;
  }

  try {
    displayDescription = tTemplates(`${slugSnake}.description`);
  } catch {
    displayDescription = template.description;
  }

  try {
    displayImpact = tTemplates(`${slugSnake}.impact`);
  } catch {
    displayImpact = template.typical_impact_text;
  }

  // Category label
  let categoryLabel: string;
  try {
    categoryLabel = t(`categories.${template.category}`);
  } catch {
    const raw = template.category.replace(/_/g, " ");
    categoryLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // Price formatting
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const setupPriceText = t.raw("setupPrice").replace("{price}", formatPrice(template.setup_price));
  const monthlyPriceText = t.raw("monthlyPrice").replace("{price}", formatPrice(template.monthly_price));
  const setupTimeText = t.raw("setupTime").replace("{days}", String(template.setup_time_days));

  const connectedApps = template.connected_apps ?? [];
  const industryTags = template.industry_tags ?? [];

  return (
    <div className="mt-4 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/catalog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {displayName}
        </h1>

        {/* Category + popular badge row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-sm text-muted-foreground">{categoryLabel}</span>
          {template.is_featured && (
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
              {t("popularBadge")}
            </span>
          )}
        </div>

        {/* Industry tags */}
        {industryTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {industryTags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Pricing block */}
        <div className="flex items-center gap-4 flex-wrap mb-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{setupPriceText}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {monthlyPriceText}
            </span>
          </div>
        </div>

        {/* CTA button */}
        <CatalogRequestButton
          label={t("requestButton")}
          toastMessage={t("requestedToast")}
        />
      </div>

      {/* Content sections */}
      <div className="flex flex-col gap-4 mt-4">

        {/* Description section */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            {t("description")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Connected apps section */}
        {connectedApps.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              {t("connectedApps")}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {connectedApps.map((app) => (
                <span
                  key={app}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${getAppColor(app)}`}
                  title={app}
                >
                  {app.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Typical impact section */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            {t("impact")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {displayImpact}
          </p>
        </div>

        {/* Setup time */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-sm text-muted-foreground">
            {setupTimeText}
          </p>
        </div>

      </div>
    </div>
  );
}
