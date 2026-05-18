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
    <main className="mx-auto w-full max-w-sm px-4 py-10 sm:px-6 sm:py-14">
      <section
        aria-labelledby="oauth-login-heading"
        className="border border-ink/10 bg-paper px-5 py-6 shadow-sm sm:px-6"
      >
        <div className="space-y-3">
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
