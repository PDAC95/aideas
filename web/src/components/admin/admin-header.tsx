import { AdminLocaleSwitcher } from "./admin-locale-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminHeaderProps {
  badgeLabel: string;
  subtitle: string;
  locale: "en" | "es";
  localeSwitcherAriaLabel: string;
  themeToggleAriaLabel: string;
}

/**
 * Admin header — Factory aesthetic with locale + theme controls on the right.
 *
 * Left: orange ADMIN badge + subtitle so staff can never mistake which area
 * they are operating in.
 * Right: minimalist EN|ES locale switcher + sun/moon theme toggle. Both
 * controls live here (not in the sidebar) because they belong to the shell
 * chrome, not to navigation.
 *
 * Hidden on mobile (<lg) — the mobile nav bar already shows the badge inline;
 * locale + theme controls are deferred to settings on mobile.
 */
export function AdminHeader({
  badgeLabel,
  subtitle,
  locale,
  localeSwitcherAriaLabel,
  themeToggleAriaLabel,
}: AdminHeaderProps) {
  return (
    <header className="hidden lg:flex items-center justify-between gap-4 px-10 pt-8 pb-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded-sm bg-primary text-primary-foreground text-xs font-bold tracking-wider">
          {badgeLabel}
        </span>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <AdminLocaleSwitcher
          initialLocale={locale}
          ariaLabel={localeSwitcherAriaLabel}
        />
        <ThemeToggle label={themeToggleAriaLabel} />
      </div>
    </header>
  );
}
