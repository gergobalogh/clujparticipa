"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { type AppLocale } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";

const navItems = [
  { key: "home", href: "/" },
  { key: "ideas", href: "/ideas" },
  { key: "map", href: "/map" },
  { key: "admin", href: "/admin" },
] as const;

export function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6 sm:py-4">
        <Link
          className="text-base font-semibold text-slate-950"
          href="/"
          locale={locale}
        >
          ClujParticipa
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {navItems.map(({ key, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <UserMenu />
          <LanguageSwitcher />

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:bg-slate-100 sm:hidden"
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
        <nav aria-label="Primary" className="border-t border-slate-100 px-4 pb-3 sm:hidden">
          {navItems.map(({ key, href }) => {
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
                  "block rounded-md px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                ].join(" ")}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
