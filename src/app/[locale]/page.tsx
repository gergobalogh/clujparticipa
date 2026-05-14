"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { IdeaCard } from "@/components/ideas/idea-card";

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

export default function LocaleHomePage() {
  const t = useTranslations("Home");

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setStats)
      .catch(() => setStatsError(true));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold text-slate-950 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            {t("description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ideas/new"
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              {t("submitIdea")}
            </Link>
            <Link
              href="/ideas"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {t("browseIdeas")}
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {t("openMap")}
            </Link>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[340px] xl:w-[400px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <svg className="absolute inset-0 h-full w-full text-blue-200" viewBox="0 0 400 300" fill="none">
              <rect width="400" height="300" fill="currentColor" opacity="0.15" />
              <circle cx="200" cy="120" r="60" stroke="currentColor" strokeWidth="2" opacity="0.4" />
              <path d="M80 250 L140 180 L200 220 L260 160 L320 210 L320 250 Z" fill="currentColor" opacity="0.2" />
              <circle cx="100" cy="80" r="4" fill="currentColor" opacity="0.3" />
              <circle cx="300" cy="60" r="3" fill="currentColor" opacity="0.25" />
              <circle cx="250" cy="100" r="5" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
        </div>
      </section>

      {!stats && !statsError && (
        <section className="mt-12" aria-busy="true">
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-md border border-slate-200 px-4 py-3">
                <div className="h-7 w-12 rounded bg-slate-200" />
                <div className="mt-1 h-4 w-24 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      )}

      {statsError && (
        <p role="alert" className="mt-8 text-sm text-slate-500">
          {t("statsTitle")} — unavailable
        </p>
      )}

      {stats && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("statsTitle")}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold text-slate-950">
                {stats.totalIdeas}
              </p>
              <p className="text-sm text-slate-500">{t("totalIdeas")}</p>
            </div>
            <div className="rounded-md border border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold text-slate-950">
                {stats.totalVotes}
              </p>
              <p className="text-sm text-slate-500">{t("totalVotes")}</p>
            </div>
            <div className="rounded-md border border-slate-200 px-4 py-3">
              <p className="text-2xl font-semibold text-slate-950">
                {stats.totalComments}
              </p>
              <p className="text-sm text-slate-500">{t("totalComments")}</p>
            </div>
          </div>
        </section>
      )}

      {stats?.recentIdeas.length ? (
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("recentIdeas")}
            </h2>
            <Link
              href="/ideas"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              {t("viewAll")} &rarr;
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                id={idea.id}
                title={idea.title}
                description=""
                category={idea.category}
                district={idea.district}
                status={idea.status}
                supportCount={idea.supportCount}
                commentCount={idea.commentCount}
                firstImage={idea.firstImage}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
