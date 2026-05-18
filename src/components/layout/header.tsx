"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { type AppLocale } from "@/i18n/routing";
import { UserMenu } from "./user-menu";

const navItems = [
  { key: "home", href: "/" },
  { key: "ideas", href: "/ideas" },
  { key: "map", href: "/map" },
  { key: "howItWorks", href: "/how-it-works" },
] as const;

export function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch("/api/voting-config")
      .then((r) => r.ok ? r.json() : { config: null })
      .then((data) => {
        if (data.config) {
          setShowResults(true);
          return;
        }
        // Fallback: check if any IN_VOTING or SELECTED ideas exist
        return fetch("/api/ideas?status=IN_VOTING&limit=1")
          .then((r) => r.ok ? r.json() : { ideas: [] })
          .then((d) => {
            if (d.ideas?.length > 0) {
              setShowResults(true);
              return;
            }
            return fetch("/api/ideas?status=SELECTED&limit=1")
              .then((r) => r.ok ? r.json() : { ideas: [] })
              .then((d2) => {
                setShowResults(d2.ideas?.length > 0);
              });
          });
      })
      .catch(() => setShowResults(false));
  }, []);

  const allNavItems = showResults
    ? [...navItems.slice(0, 3), { key: "results", href: "/results" }]
    : navItems;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6">
        <Link
          className="flex items-center h-12 overflow-visible"
          href="/"
          locale={locale}
        >
          <img
            src="/logo.png"
            alt="ClujParticipa"
            className="h-32 w-auto -my-10"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {allNavItems.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition border-b-2",
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-ink/30",
                ].join(" ")}
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            );
          })}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2">
          <UserMenu />

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center rounded-sm p-1.5 text-ink-muted hover:text-ink sm:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav aria-label="Primary" className="border-t border-ink/5 px-4 pb-3 sm:hidden">
          {allNavItems.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={[
                  "block px-2 py-2 text-sm font-bold uppercase tracking-widest transition border-l-2",
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-ink/30",
                ].join(" ")}
              >
                {t(key as Parameters<typeof t>[0])}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
