import { defineRouting } from "next-intl/routing";
import type { Pathnames } from "next-intl/routing";

export const locales = ["ro", "hu", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "ro";

const pathnames: Pathnames<typeof locales> = {
  "/how-it-works": {
    ro: "/cum-functioneaza",
    hu: "/hogyan-mukodik",
    en: "/how-it-works",
  },
  "/login": {
    ro: "/autentificare",
    hu: "/bejelentkezes",
    en: "/sign-in",
  },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames,
});

export function isAppLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}
