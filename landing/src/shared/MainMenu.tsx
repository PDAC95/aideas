import { NavLink } from "react-router-dom";
import { MainMenuRootList } from "@/shared/mobile-menu/MobileMenuCloneContext";

/**
 * AIDEAS landing nav. Six public routes + external links to the dashboard.
 *
 * Dashboard URL is read from `VITE_APP_URL` so dev (`http://localhost:4000`)
 * and prod (`https://app.aideas.ca`) can both work without code changes.
 */
const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.aideas.ca";

type InternalItem = { to: string; label: string };

const NAV_ITEMS: InternalItem[] = [
  { to: "/services", label: "Services" },
  { to: "/catalog", label: "Catalog" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

function LinkSwap({ label }: { label: string }) {
  return (
    <span className="at-link-swap">
      <span className="text-1">{label}</span>
      <span className="text-2">{label}</span>
    </span>
  );
}

export default function MainMenu() {
  return (
    <MainMenuRootList>
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            <LinkSwap label={item.label} />
          </NavLink>
        </li>
      ))}
      <li>
        <a href={`${APP_URL}/login`}>
          <LinkSwap label="Log in" />
        </a>
      </li>
      <li>
        <a href={`${APP_URL}/signup`}>
          <LinkSwap label="Sign up" />
        </a>
      </li>
    </MainMenuRootList>
  );
}
