"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";

const localeLabels: Record<AppLocale, string> = {
  ro: "RO",
  hu: "HU",
  en: "EN",
};

export function LanguageSwitcher() {
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1">
      {locales.map((locale) => {
        const isActive = locale === activeLocale;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex h-9 min-w-10 items-center justify-center rounded-sm border px-3 text-sm font-medium transition",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 bg-paper text-ink-muted hover:border-ink/30",
            ].join(" ")}
            href={pathname}
            key={locale}
            locale={locale}
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
