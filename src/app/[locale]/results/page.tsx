import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";

export default async function ResultsPage() {
  const t = await getTranslations("Results");
  const tc = await getTranslations("Categories");
  const td = await getTranslations("Districts");
  const ts = await getTranslations("Statuses");

  const [selectedIdeas, votingIdeas, votingConfig] = await Promise.all([
    prisma.idea.findMany({
      where: { status: "SELECTED" },
      orderBy: { votes: { _count: "desc" } },
      include: {
        _count: { select: { votes: true } },
        images: { where: { order: 0 }, select: { url: true, alt: true }, take: 1 },
      },
    }),
    prisma.idea.findMany({
      where: { status: "IN_VOTING" },
      orderBy: { votes: { _count: "desc" } },
      include: {
        _count: { select: { votes: true } },
        images: { where: { order: 0 }, select: { url: true, alt: true }, take: 1 },
      },
    }),
    prisma.votingConfig.findFirst(),
  ]);

  const hasContent = selectedIdeas.length > 0 || votingIdeas.length > 0 || votingConfig;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-600">{t("description")}</p>

      {votingConfig && (
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">
            {t("votingPeriod")}: {new Date(votingConfig.startsAt).toLocaleDateString()} – {new Date(votingConfig.endsAt).toLocaleDateString()}
            {votingConfig.label && ` · ${votingConfig.label}`}
          </p>
        </div>
      )}

      {!hasContent && (
        <p className="mt-6 text-sm text-slate-500">{t("noResults")}</p>
      )}

      {selectedIdeas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("selectedHeading")}
          </h2>
          <ul className="mt-4 space-y-3">
            {selectedIdeas.map((idea) => (
              <li key={idea.id} className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="mr-2 inline-flex items-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                      {t("winner")}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-blue-700"
                    >
                      {idea.title}
                    </Link>
                  </div>
                  <Badge variant={statusToBadgeVariant(idea.status)}>
                    {ts("SELECTED")}
                  </Badge>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-slate-500">
                  <span>{tc(idea.category as Parameters<typeof tc>[0])}</span>
                  <span>{td(idea.district as Parameters<typeof td>[0])}</span>
                  <span>{idea._count.votes} {ts("SELECTED").toLowerCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {votingIdeas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("allVotesHeading")}
          </h2>
          <ol className="mt-4 space-y-2">
            {votingIdeas.map((idea, idx) => (
              <li key={idea.id} className="flex items-center gap-3 rounded-md border border-slate-200 px-4 py-3">
                <span className="text-sm font-medium text-slate-400 w-6">{idx + 1}.</span>
                <Link
                  href={`/ideas/${idea.id}`}
                  className="flex-1 text-sm font-medium text-slate-900 hover:text-blue-700"
                >
                  {idea.title}
                </Link>
                <span className="text-sm text-slate-600">{idea._count.votes}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
