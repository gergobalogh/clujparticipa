"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EditorialIdeaCard } from "@/components/ideas/editorial-idea-card";
import { SidebarCta } from "@/components/ideas/sidebar-cta";
import { LiveBadge } from "@/components/ui/live-badge";
import { HomeMapPreview } from "@/components/map/home-map-preview";
import { computeCompletedCount, resolveZeroState } from "@/lib/home-stats";
import type { IdeaMapData } from "@/components/map/map-view";

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
  const prefersReducedMotion = useReducedMotion();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [votingConfig, setVotingConfig] = useState<VotingConfigData | null>(null);
  const [mapIdeas, setMapIdeas] = useState<IdeaMapData[]>([]);

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

    fetch("/api/ideas?limit=50")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const filtered = (data.ideas ?? [])
          .filter(
            (i: { latitude: number; longitude: number }) =>
              Number.isFinite(i.latitude) &&
              Number.isFinite(i.longitude) &&
              i.latitude !== 0 &&
              i.longitude !== 0
          )
          .map((i: { id: string; title: string; status: string; district: string; category: string; supportCount: number; latitude: number; longitude: number }) => ({
            id: i.id,
            title: i.title,
            status: i.status,
            district: i.district,
            category: i.category,
            supportCount: i.supportCount,
            latitude: i.latitude,
            longitude: i.longitude,
          }));
        setMapIdeas(filtered);
      })
      .catch(() => setMapIdeas([]));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header with brand */}
      <section className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted leading-relaxed">
          {t("description")}
        </p>
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
          <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
            <span className="text-xs font-semibold text-ink">{computeCompletedCount(stats.statusCounts)}</span>
            <span className="text-xs text-ink-muted">{t("completedIdeas")}</span>
          </div>
          {votingConfig && (
            <div className="flex items-center gap-2 rounded-sm border border-ink/8 bg-paper px-3 py-2">
              <span className={`h-2 w-2 rounded-full ${votingConfig.isOpen ? "bg-civic-teal" : "bg-ink-muted"}`} aria-hidden="true" />
              <span className="text-xs text-ink-muted">{t("votingPhase")}:</span>
              <span className="text-xs font-semibold text-ink">{votingConfig.isOpen ? t("votingOpen") : t("votingClosed")}</span>
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
          {t("statsTitle")} — {t("unavailable")}
        </p>
      )}

      {/* Main content: flex split layout — sidebar + map */}
      <div data-testid="split-layout" className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: idea list */}
        <motion.aside
          data-testid="sidebar"
          className="w-full md:w-[400px] shrink-0 flex flex-col"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-serif italic text-ink">
                {t("recentIdeas")}
              </h2>
              <LiveBadge
                votingOpen={votingConfig?.isOpen ?? false}
                totalIdeas={stats?.totalIdeas ?? 0}
              />
            </div>
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
              {stats.recentIdeas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
                  className="border-b border-ink/8 last:border-b-0"
                >
                  <EditorialIdeaCard
                    id={idea.id}
                    title={idea.title}
                    category={idea.category}
                    district={idea.district}
                    status={idea.status}
                    supportCount={idea.supportCount}
                    commentCount={idea.commentCount}
                  />
                </motion.div>
              ))}
            </div>
          ) : stats ? (
            <p className="mt-4 text-sm text-ink-muted">{t(resolveZeroState(stats.totalIdeas))}</p>
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
          <SidebarCta />
        </motion.aside>

        {/* Map area */}
        <motion.section
          data-testid="map-area"
          className="flex-1 min-h-0"
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="border-b border-ink/10 pb-2">
            <h2 className="font-serif text-ink">
              {t("openMap")}
            </h2>
          </div>
          <div className="mt-2 h-[360px] md:h-full">
            <Link href="/map" className="block group h-full">
              <HomeMapPreview ideas={mapIdeas} />
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
