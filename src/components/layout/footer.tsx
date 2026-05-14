"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { type AppLocale } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale() as AppLocale;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <p className="text-sm text-slate-500">{t("prototypeNote")}</p>
        <p className="mt-2 text-sm text-slate-500">{t("nonBinding")}</p>
        <div className="mt-3 flex items-center gap-2">
          <Link
            href="/bug-report"
            locale={locale}
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("bugReport")}
          </Link>
          <span className="text-sm text-slate-400">|</span>
          <Link
            href="/privacy"
            locale={locale}
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("privacy")}
          </Link>
          <span className="text-sm text-slate-400">|</span>
          <Link
            href="/data-deletion"
            locale={locale}
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("dataDeletion")}
          </Link>
          <span className="text-sm text-slate-400">|</span>
          <Link
            href="/terms"
            locale={locale}
            className="text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
