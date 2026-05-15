interface AdminHeaderProps {
  badgeLabel: string;
  subtitle: string;
}

/**
 * Admin header — minimal for 17-03.
 *
 * Renders the orange ADMIN badge alongside a subtitle so staff can never
 * mistake which area they are operating in. Phases 18-22 may add a global
 * search bar or user menu — out of scope here. Hidden on mobile (the
 * mobile nav bar already shows the badge inline).
 */
export function AdminHeader({ badgeLabel, subtitle }: AdminHeaderProps) {
  return (
    <header className="hidden lg:flex items-center gap-4 px-10 pt-8 pb-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded-sm bg-primary text-primary-foreground text-xs font-bold tracking-wider">
          {badgeLabel}
        </span>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}
