"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { IdeaListRow } from "@/components/ideas/idea-list-row";
import { HomeMapPreview } from "@/components/map/home-map-preview";

interface RecentIdea {
  id: string;
  title: string;
  category: string;
  district: string;
  status: string;
  createdAt: string;
  supportCount: number;
  commentCount: number;
  firstImage: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
  } | null;
}

interface Stats {
  totalIdeas: number;
  totalVotes: number;
  totalComments: number;
  recentIdeas: RecentIdea[];
  statusCounts: Record<string, number>;
}

interface VotingConfigData {
  startsAt: string;
  endsAt: string;
  label: string | null;
  isOpen: boolean;
}

export default function LocaleHomePage() {
  const t = useTranslations("Home");

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [votingConfig, setVotingConfig] = useState<VotingConfigData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setStats)
      .catch(() => setStatsError(true));

    fetch("/api/voting-config")
      .then((r) => (r.ok ? r.json() : { config: null }))
      .then((data) => setVotingConfig(data.config ?? null))
      .catch(() => {});
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header with brand + action */}
      <section className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted leading-relaxed">
          {t("description")}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/ideas/new"
            className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
          >
            {t("submitIdea")}
          </Link>
          <Link
            href="/ideas"
            className="inline-flex items-center rounded-sm border border-ink/15 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            {t("browseIdeas")}
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center rounded-sm border border-ink/15 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            {t("openMap")}
          </Link>
        </div>
      </section>

      {/* Civic status strip (Task 6) */}
      {stats && (
        <section className="mb-6 flex flex-wrap gap-3" aria-label={t("civicStatus")}>
          <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-civic-teal" aria-hidden="true" />
            <span className="text-xs font-semibold text-ink">{stats.totalIdeas}</span>
            <span className="text-xs text-ink-muted">{t("totalIdeas")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
            <span className="text-xs font-semibold text-ink">{stats.totalVotes}</span>
            <span className="text-xs text-ink-muted">{t("totalVotes")}</span>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
            <span className="text-xs font-semibold text-ink">{stats.totalComments}</span>
            <span className="text-xs text-ink-muted">{t("totalComments")}</span>
          </div>
          {votingConfig && (
            <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
              <span className={`h-2 w-2 rounded-full ${votingConfig.isOpen ? "bg-civic-teal" : "bg-ink-muted"}`} aria-hidden="true" />
              <span className="text-xs text-ink-muted">{t("votingPhase")}:</span>
              <span className="text-xs font-semibold text-ink">{votingConfig.isOpen ? "Open" : "Closed"}</span>
            </div>
          )}
        </section>
      )}

      {!stats && !statsError && (
        <section className="mb-6 flex flex-wrap gap-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-sm border border-ink/8 bg-paper px-3 py-2">
              <div className="h-5 w-20 rounded bg-paper-muted" />
            </div>
          ))}
        </section>
      )}

      {statsError && (
        <p role="alert" className="mb-6 text-sm text-ink-muted">
          {t("statsTitle")} — unavailable
        </p>
      )}

      {/* Main content: ideas feed + map preview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Recent ideas feed */}
        <section>
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink">
              {t("recentIdeas")}
            </h2>
            {stats && stats.recentIdeas.length > 0 && (
              <Link
                href="/ideas"
                className="text-xs font-medium text-civic-blue hover:text-ink transition"
              >
                {t("viewAll")} &rarr;
              </Link>
            )}
          </div>

          {stats && stats.recentIdeas.length > 0 ? (
            <div className="mt-0">
              {stats.recentIdeas.map((idea) => (
                <IdeaListRow
                  key={idea.id}
                  id={idea.id}
                  title={idea.title}
                  category={idea.category}
                  district={idea.district}
                  status={idea.status}
                  supportCount={idea.supportCount}
                  commentCount={idea.commentCount}
                  firstImage={idea.firstImage}
                />
              ))}
            </div>
          ) : stats ? (
            <p className="mt-4 text-sm text-ink-muted">No ideas yet.</p>
          ) : (
            <div className="mt-4 space-y-3" aria-busy="true">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border-b border-ink/5 py-3">
                  <div className="h-3 w-24 rounded bg-paper-muted" />
                  <div className="mt-2 h-5 w-3/4 rounded bg-paper-muted" />
                  <div className="mt-2 h-3 w-32 rounded bg-paper-muted" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Map preview */}
        <section className="hidden lg:block">
          <div className="border-b border-ink/10 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink">
              {t("openMap")}
            </h2>
          </div>
          <div className="mt-2">
            <Link href="/map" className="block group">
              <HomeMapPreview />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
