import { defineRouting } from "next-intl/routing";

export const locales = ["ro", "hu", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "ro";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function isAppLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}
