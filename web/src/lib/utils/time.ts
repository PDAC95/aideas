/**
 * Shared relative-time formatter consumed by both client and server components.
 *
 * Uses i18n keys from `common.timeAgo.*` (compact namespace — values like "m", "h", "d"
 * are appended after the count in code, NOT via ICU interpolation).
 *
 * Compatible with both `useTranslations("common")` (client) and `getTranslations("common")` (server)
 * via a structural type — avoids importing next-intl-specific types into a util module.
 *
 * Examples (English): "now" | "5m" | "2h" | "3d"
 * Examples (Spanish): "ahora" | "5m" | "2h" | "3d"
 */

type TimeT = (key: string) => string;

export function formatRelativeTime(date: Date | string, t: TimeT): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return t("timeAgo.now");
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${t("timeAgo.minutes")}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${t("timeAgo.hours")}`;
  return `${Math.floor(seconds / 86400)}${t("timeAgo.days")}`;
}
