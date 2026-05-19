"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { IdeaListRow } from "@/components/ideas/idea-list-row";
import { trackEvent } from "@/lib/analytics";

type IdeaSummary = {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  status: string;
  createdAt: string;
  supportCount: number;
  commentCount: number;
  rejectionNote: string | null;
  firstImage: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
  } | null;
};

const CATEGORIES = [
  "INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE",
  "SAFETY", "TRANSPORT", "HEALTH", "OTHER",
];

const DISTRICTS = [
  "MANASTUR", "GHEORGHENI", "ZORILOR", "CENTRU", "MARASTI",
  "GRIGORESCU", "IRIS", "GRUIA", "ANDREI_MURESANU", "BUNA_ZIUA",
  "BORHANCI", "DAMBU_ROTUND", "OTHER",
];

const STATUSES = [
  "SUBMITTED", "IN_VOTING", "SELECTED", "ACCEPTED",
  "IN_PROGRESS", "COMPLETED", "REJECTED", "NEEDS_REVISION",
  "MERGED", "WITHDRAWN",
];

const SORT_OPTIONS = ["newest", "oldest", "mostVotes"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const sortToParam: Record<SortOption, string> = {
  newest: "date",
  oldest: "date",
  mostVotes: "votes",
};

const sortToOrder: Record<SortOption, string> = {
  newest: "desc",
  oldest: "asc",
  mostVotes: "desc",
};

export default function IdeasPage() {
  const t = useTranslations("Ideas");
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const ts = useTranslations("Statuses");

  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showRejected, setShowRejected] = useState(true);

  const fetchIdeas = useCallback(
    async (pageNum: number, append = false) => {
      requestAnimationFrame(() => {
        setLoading(true);
        setFetchError(false);
      });
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "12",
        sort: sortToParam[sort],
        order: sortToOrder[sort],
        showRejected: String(showRejected),
      });
      if (category) params.set("category", category);
      if (district) params.set("district", district);
      if (status) params.set("status", status);

      try {
        const res = await fetch(`/api/ideas?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setIdeas((prev) => (append ? [...prev, ...data.ideas] : data.ideas));
        setHasMore(data.ideas.length === 12);
      } catch {
        setFetchError(true);
        if (!append) setIdeas([]);
      } finally {
        setLoading(false);
      }
    },
    [category, district, status, sort, showRejected]
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      setPage(1);
      fetchIdeas(1);
    });
  }, [fetchIdeas]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchIdeas(next, true);
  };

  const handleFilterChange = (
    filter: "category" | "district" | "status",
    value: string
  ) => {
    trackEvent("filter_change", { filter, value });
    if (filter === "category") setCategory(value);
    if (filter === "district") setDistrict(value);
    if (filter === "status") setStatus(value);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t("description")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          aria-label={t("filterCategory")}
          value={category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="rounded-sm border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        >
          <option value="">{t("allCategories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tc(c as Parameters<typeof tc>[0])}
            </option>
          ))}
        </select>

        <select
          aria-label={t("filterDistrict")}
          value={district}
          onChange={(e) => handleFilterChange("district", e.target.value)}
          className="rounded-sm border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        >
          <option value="">{t("allDistricts")}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {td(d as Parameters<typeof td>[0])}
            </option>
          ))}
        </select>

        <select
          aria-label={t("filterStatus")}
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="rounded-sm border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        >
          <option value="">{t("allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ts(s as Parameters<typeof ts>[0])}
            </option>
          ))}
        </select>

        <select
          aria-label={t("sortLabel")}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-sm border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {t(`sort${o.charAt(0).toUpperCase() + o.slice(1)}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowRejected((v) => !v)}
          className="rounded-sm border border-ink/15 bg-paper px-3 py-1.5 text-sm text-ink transition hover:bg-paper-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
        >
          {showRejected ? t("hideRejected") : t("showRejected")}
        </button>
      </div>

      {fetchError && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {t("noIdeas")}
        </p>
      )}

      {!fetchError && ideas.length === 0 && !loading && (
        <p className="mt-8 text-sm text-ink-muted">{t("noIdeas")}</p>
      )}

      {ideas.length > 0 && (
        <div className="mt-6">
          {ideas.map((idea) => (
            <IdeaListRow
              key={idea.id}
              id={idea.id}
              title={idea.title}
              description={idea.description}
              category={idea.category}
              district={idea.district}
              status={idea.status}
              supportCount={idea.supportCount}
              commentCount={idea.commentCount}
              firstImage={idea.firstImage}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-ink-muted" aria-busy="true" role="status">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 rounded-sm border border-ink/15 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-muted"
        >
          {t("loadMore")}
        </button>
      )}

      {!loading && !hasMore && ideas.length > 0 && (
        <p className="mt-4 text-sm text-ink-muted">{t("noMore")}</p>
      )}
    </main>
  );
}
