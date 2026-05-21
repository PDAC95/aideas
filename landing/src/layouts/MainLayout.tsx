import { Outlet } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import PopupSearch from "@/shared/PopupSearch";
import Header2 from "@/shared/header/Header2";
import Footer2 from "@/shared/footer/Footer2";
import SideBar from "@/shared/sidebar/SideBar";
import { MobileMenuCloneProvider } from "@/shared/mobile-menu/MobileMenuCloneContext";
import GlobalEffects from "@/shared/effects/GlobalEffects";
import ThemeRouteSync from "@/shared/effects/ThemeRouteSync";
import BackToTop from "@/shared/elements/BackToTop";
import SmoothScrollEffect from "@/shared/effects/SmoothScrollEffect";

type HeaderHandlers = {
  onOpenSearch?: () => void;
  onToggleSidebar?: () => void;
  onOpenHamburgerMenu?: () => void;
  style?: string;
};

// AIDEAS landing: we standardised on header/footer style 2 across every route.
// `headerStyle` / `footerStyle` props are kept for API compatibility with the
// original Orisa template, but only style 2 is wired here.
const HEADER_COMPONENTS: Record<number, React.ComponentType<HeaderHandlers>> = {
  2: Header2,
};

const FOOTER_COMPONENTS: Record<number, React.ComponentType> = {
  2: Footer2 as unknown as React.ComponentType,
};

export type MainLayoutProps = {
  headerStyle?: number;
  footerStyle?: number;
  noFooter?: boolean;
  mainClass?: string;
  headerProps?: { style?: string };
};

export default function MainLayout({
  headerStyle = 1,
  footerStyle = 1,
  noFooter = false,
  mainClass = "bg-neutral-0",
  headerProps,
}: MainLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

  const handlers = useMemo(
    () => ({
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      toggleSidebar: () => setSidebarOpen((v) => !v),
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      openHamburgerMenu: () => setHamburgerMenuOpen(true),
      closeHamburgerMenu: () => setHamburgerMenuOpen(false),
      closeAllMenus: () => {
        setSidebarOpen(false);
        setHamburgerMenuOpen(false);
      },
    }),
    [],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSidebarOpen(false);
        setHamburgerMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Bridge DOM class triggers (used by Header4-15 ported from Next.js) to MainLayout state.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (t.closest(".at-search-click, .search-btn")) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (t.closest(".at-header-sidebar-btn, .navbar-toggler, .at-menu-bar")) {
        e.preventDefault();
        setSidebarOpen(true);
        return;
      }
      if (t.closest(".at-header-menu-btn")) {
        e.preventDefault();
        const btn = (t.closest(".at-header-menu-btn") as HTMLElement) ?? null;
        const header = btn?.closest("header");
        if (header) {
          const isOpen = header.classList.contains("is-menu-open");
          header.classList.toggle("is-menu-open", !isOpen);
          btn?.setAttribute("aria-expanded", String(!isOpen));
        }
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Sticky header on scroll (mirrors useHeaderInteractive behaviour for all headers)
  useEffect(() => {
    const el = document.getElementById("header-sticky");
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY ?? window.pageYOffset;
      el.classList.toggle("header-sticky", y >= 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const HeaderComponent = HEADER_COMPONENTS[headerStyle] ?? Header2;
  const FooterComponent = FOOTER_COMPONENTS[footerStyle] ?? Footer2;
  const isFooterFloating = footerStyle === 2;

  return (
    <MobileMenuCloneProvider>
      <div className="px-blur-bottom" />
      <SmoothScrollEffect />
      <GlobalEffects />
      <ThemeRouteSync />
      <HeaderComponent
        {...(headerProps ?? {})}
        onOpenSearch={handlers.openSearch}
        onToggleSidebar={handlers.toggleSidebar}
        onOpenHamburgerMenu={handlers.openHamburgerMenu}
      />
      <SideBar open={sidebarOpen} hamburgerOpen={hamburgerMenuOpen} onClose={handlers.closeAllMenus} />
      <PopupSearch open={searchOpen} onClose={handlers.closeSearch} />

      <div id="smooth-wrapper">
        <div id="smooth-content" className="z-index-3">
          <main className={mainClass}>
            <Outlet />
          </main>
          {!noFooter && isFooterFloating ? <div className="footer-placeholder" aria-hidden="true" /> : null}
          {!noFooter && !isFooterFloating ? <FooterComponent /> : null}
        </div>
        {!noFooter && isFooterFloating ? <Footer2 ref={footerRef} /> : null}
      </div>

      <BackToTop />
    </MobileMenuCloneProvider>
  );
}
