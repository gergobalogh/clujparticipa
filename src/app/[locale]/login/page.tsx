"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const providers = [
  {
    id: "google",
    key: "googleButton",
    mark: "G",
    className:
      "border-civic-blue/25 text-civic-blue hover:border-civic-blue hover:bg-civic-blue-light/55",
  },
  {
    id: "facebook",
    key: "facebookButton",
    mark: "f",
    className:
      "border-civic-teal/25 text-civic-teal hover:border-civic-teal hover:bg-civic-teal-light/65",
  },
] as const;

export default function LoginPage() {
  const t = useTranslations("AuthPage");

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-[1.08fr_0.92fr] md:items-start">
      <section className="border-t border-ink/10 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-civic-orange">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
          {t("subtitle")}
        </p>

        <div className="mt-8 grid gap-3 border-y border-ink/10 py-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink">
              {t("trustHeading")}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {t("trustText")}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink">
              {t("prototypeHeading")}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {t("prototypeText")}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="oauth-login-heading"
        className="border border-ink/10 bg-paper px-5 py-6 shadow-sm sm:px-6"
      >
        <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-civic-teal"
          />
          <div>
            <h2
              id="oauth-login-heading"
              className="font-serif text-2xl font-bold text-ink"
            >
              {t("panelTitle")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("panelSubtitle")}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => signIn(provider.id)}
              className={[
                "flex w-full items-center justify-between rounded-sm border bg-paper px-4 py-3 text-left text-sm font-semibold transition cursor-pointer",
                provider.className,
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-current/25 font-serif text-lg">
                  {provider.mark}
                </span>
                {t(provider.key)}
              </span>
              <span aria-hidden="true" className="text-lg leading-none">
                &rarr;
              </span>
            </button>
          ))}
        </div>

        <p className="mt-5 border-t border-ink/10 pt-4 text-sm leading-6 text-ink-muted">
          {t("privacyNote")}
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex text-sm font-semibold text-civic-blue transition hover:text-ink"
        >
          {t("backHome")}
        </Link>
      </section>
    </main>
  );
}
