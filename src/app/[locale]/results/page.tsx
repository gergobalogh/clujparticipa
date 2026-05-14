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
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t("description")}</p>

      {votingConfig && (
        <div className="mt-4 rounded-sm border border-ink/10 bg-paper-muted px-4 py-3">
          <p className="text-sm text-ink">
            {t("votingPeriod")}: {new Date(votingConfig.startsAt).toLocaleDateString()} – {new Date(votingConfig.endsAt).toLocaleDateString()}
            {votingConfig.label && ` · ${votingConfig.label}`}
          </p>
        </div>
      )}

      {!hasContent && (
        <p className="mt-6 text-sm text-ink-muted">{t("noResults")}</p>
      )}

      {selectedIdeas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {t("selectedHeading")}
          </h2>
          <ul className="mt-4 space-y-0">
            {selectedIdeas.map((idea) => (
              <li key={idea.id} className="border-b border-ink/8 px-0 py-3 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="mr-2 inline-flex items-center rounded-sm bg-civic-teal-light px-1.5 py-0.5 text-xs font-semibold text-civic-teal uppercase tracking-wide">
                      {t("winner")}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="font-serif text-sm font-semibold text-ink hover:text-civic-blue transition"
                    >
                      {idea.title}
                    </Link>
                  </div>
                  <Badge variant={statusToBadgeVariant(idea.status)}>
                    {ts("SELECTED")}
                  </Badge>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-ink-muted">
                  <span className="uppercase tracking-wide font-semibold">{tc(idea.category as Parameters<typeof tc>[0])}</span>
                  <span className="text-ink/20">·</span>
                  <span className="uppercase tracking-wide font-semibold">{td(idea.district as Parameters<typeof td>[0])}</span>
                  <span className="text-ink/20">·</span>
                  <span>{idea._count.votes} {ts("SELECTED").toLowerCase()}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {votingIdeas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {t("allVotesHeading")}
          </h2>
          <ol className="mt-4 space-y-0">
            {votingIdeas.map((idea, idx) => (
              <li key={idea.id} className="flex items-center gap-3 border-b border-ink/8 px-0 py-3 last:border-b-0">
                <span className="text-sm font-medium text-ink-muted w-6">{idx + 1}.</span>
                <Link
                  href={`/ideas/${idea.id}`}
                  className="flex-1 font-serif text-sm font-semibold text-ink hover:text-civic-blue transition"
                >
                  {idea.title}
                </Link>
                <span className="text-sm text-ink-muted">{idea._count.votes}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
