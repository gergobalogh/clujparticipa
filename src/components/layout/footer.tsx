"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { type AppLocale, locales } from "@/i18n/routing";

const localeLabels: Record<AppLocale, string> = {
  ro: "RO",
  hu: "HU",
  en: "EN",
};

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  return (
    <footer className="border-t-2 border-ink bg-paper">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Column 1: About */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">
              About
            </span>
            <p className="mt-3 font-serif text-sm italic leading-relaxed text-ink">
              {t("prototypeNote")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {t("nonBinding")}
            </p>
          </div>

          {/* Column 2: Legal */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">
              Legal
            </span>
            <div className="mt-3 flex flex-col gap-1">
              <Link
                href="/how-it-works"
                locale={locale}
                className="py-1 text-sm text-ink-muted transition hover:text-ink"
              >
                {t("howItWorks")}
              </Link>
              <Link
                href="/bug-report"
                locale={locale}
                className="py-1 text-sm text-ink-muted transition hover:text-ink"
              >
                {t("bugReport")}
              </Link>
              <Link
                href="/privacy"
                locale={locale}
                className="py-1 text-sm text-ink-muted transition hover:text-ink"
              >
                {t("privacy")}
              </Link>
              <Link
                href="/data-deletion"
                locale={locale}
                className="py-1 text-sm text-ink-muted transition hover:text-ink"
              >
                {t("dataDeletion")}
              </Link>
              <Link
                href="/terms"
                locale={locale}
                className="py-1 text-sm text-ink-muted transition hover:text-ink"
              >
                {t("terms")}
              </Link>
            </div>
          </div>

          {/* Column 3: Language */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40">
              Language
            </span>
            <nav
              aria-label={t("languageLabel")}
              className="mt-3 flex items-center gap-1"
            >
              {locales.map((loc) => {
                const isActive = loc === locale;
                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex h-8 min-w-9 items-center justify-center rounded-sm border px-2.5 text-xs font-semibold transition",
                      isActive
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/15 bg-paper text-ink-muted hover:border-ink/30",
                    ].join(" ")}
                    href={pathname}
                    key={loc}
                    locale={loc}
                  >
                    {localeLabels[loc]}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-6 border-t border-ink/5 pt-4">
          <p className="text-xs text-ink-muted/60">ClujParticipa 2026</p>
        </div>
      </div>
    </footer>
  );
}
