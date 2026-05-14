import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function TermsPage() {
  const t = useTranslations("Terms");

  const sections = [
    { heading: t("prototypeHeading"), text: t("prototypeText") },
    { heading: t("scopeHeading"), text: t("scopeText") },
    { heading: t("accountsHeading"), text: t("accountsText") },
    { heading: t("contentHeading"), text: t("contentText") },
    { heading: t("votingHeading"), text: t("votingText") },
    { heading: t("moderationHeading"), text: t("moderationText") },
    { heading: t("liabilityHeading"), text: t("liabilityText") },
    { heading: t("changesHeading"), text: t("changesText") },
    { heading: t("governingHeading"), text: t("governingText") },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        {t("title")}
      </h1>
      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-base font-semibold text-slate-950">
              {s.heading}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{s.text}</p>
          </section>
        ))}
        <section>
          <h2 className="text-base font-semibold text-slate-950">
            {t("privacyHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("privacyText")}
          </p>
          <Link
            href="/privacy"
            className="mt-2 inline-block text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("privacyHeading")} &rarr;
          </Link>
        </section>
      </div>
    </main>
  );
}
