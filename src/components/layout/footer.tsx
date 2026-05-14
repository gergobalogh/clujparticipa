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
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-paper/70 leading-relaxed">{t("prototypeNote")}</p>
            <p className="mt-1 text-xs text-paper/50 leading-relaxed">{t("nonBinding")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href="/bug-report"
                locale={locale}
                className="text-xs text-paper/60 underline hover:text-paper"
              >
                {t("bugReport")}
              </Link>
              <span className="text-paper/20">·</span>
              <Link
                href="/privacy"
                locale={locale}
                className="text-xs text-paper/60 underline hover:text-paper"
              >
                {t("privacy")}
              </Link>
              <span className="text-paper/20">·</span>
              <Link
                href="/data-deletion"
                locale={locale}
                className="text-xs text-paper/60 underline hover:text-paper"
              >
                {t("dataDeletion")}
              </Link>
              <span className="text-paper/20">·</span>
              <Link
                href="/terms"
                locale={locale}
                className="text-xs text-paper/60 underline hover:text-paper"
              >
                {t("terms")}
              </Link>
            </div>
          </div>

          {/* Language switcher in footer */}
          <nav
            aria-label={t("languageLabel")}
            className="flex items-center gap-1 shrink-0"
          >
            {locales.map((loc) => {
              const isActive = loc === locale;
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex h-8 min-w-9 items-center justify-center rounded-sm px-2.5 text-xs font-semibold transition",
                    isActive
                      ? "bg-paper text-ink"
                      : "text-paper/50 border border-paper/20 hover:text-paper hover:border-paper/40",
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
    </footer>
  );
}
