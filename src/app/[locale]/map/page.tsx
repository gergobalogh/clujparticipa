"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MapLoader } from "@/components/map/map-loader";
import type { IdeaMapData } from "@/components/map/map-view";

const CATEGORIES = [
  "INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE",
  "SAFETY", "TRANSPORT", "HEALTH", "OTHER",
];

const STATUSES = [
  "SUBMITTED", "UNDER_REVIEW", "ELIGIBLE", "IN_VOTING",
  "SELECTED", "IN_PROGRESS", "COMPLETED", "REJECTED",
];

export default function MapPage() {
  const t = useTranslations("Map");
  const tc = useTranslations("Categories");
  const ts = useTranslations("Statuses");

  const [ideas, setIdeas] = useState<IdeaMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    requestAnimationFrame(() => setLoading(true));
    const params = new URLSearchParams({ limit: "100" });
    if (category) params.set("category", category);
    if (status) params.set("status", status);

    fetch(`/api/ideas?${params}`)
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
        setIdeas(filtered);
      })
      .catch(() => setIdeas([]))
      .finally(() => setLoading(false));
  }, [category, status]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">{t("description")}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          aria-label={t("filterCategory")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t("allCategories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tc(c as Parameters<typeof tc>[0])}
            </option>
          ))}
        </select>

        <select
          aria-label={t("filterStatus")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t("allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ts(s as Parameters<typeof ts>[0])}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex h-[500px] items-center justify-center rounded-md border border-slate-200 bg-slate-50" aria-busy="true" role="status">
            <svg className="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex h-[500px] items-center justify-center rounded-md border border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">{t("noIdeasOnMap")}</p>
          </div>
        ) : (
          <MapLoader ideas={ideas} />
        )}
      </div>
    </main>
  );
}
