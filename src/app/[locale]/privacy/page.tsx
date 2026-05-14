import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  const sections = [
    { heading: t("prototypeHeading"), text: t("prototypeText") },
    { heading: t("dataHeading"), text: t("dataText") },
    { heading: t("votesHeading"), text: t("votesText") },
    { heading: t("anonymityHeading"), text: t("anonymityText") },
    { heading: t("oauthHeading"), text: t("oauthText") },
    { heading: t("moderationHeading"), text: t("moderationText") },
    { heading: t("identityHeading"), text: t("identityText") },
    { heading: t("controllerHeading"), text: t("controllerText") },
    { heading: t("legalBasisHeading"), text: t("legalBasisText") },
    { heading: t("rightsHeading"), text: t("rightsText") },
    { heading: t("retentionPolicyHeading"), text: t("retentionPolicyText") },
    { heading: t("dpoHeading"), text: t("dpoText") },
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
            {t("dataDeletionHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("dataDeletionText")}
          </p>
          <Link
            href="/data-deletion"
            className="mt-2 inline-block text-sm text-blue-700 underline hover:text-blue-900"
          >
            {t("dataDeletionHeading")} &rarr;
          </Link>
        </section>
      </div>
    </main>
  );
}
