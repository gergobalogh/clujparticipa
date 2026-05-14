"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import { QUICK_ACTIONS, ALL_STATUSES, type QuickAction } from "@/lib/transitions";
import type { Status } from "@prisma/client";
import Image from "next/image";

type IdeaSummary = {
  id: string;
  title: string;
  category: string;
  district: string;
  status: string;
  supportCount: number;
  commentCount: number;
  firstImage: {
    url: string;
    alt: string | null;
  } | null;
  _count?: {
    images?: number;
  };
};

type CommentSummary = {
  id: string;
  text: string;
  status: string;
  ideaId: string;
  createdAt: string;
};

export default function AdminPage() {
  const t = useTranslations("Admin");
  const ts = useTranslations("Statuses");
  const tqa = useTranslations("Admin.quickActions");

  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tab, setTab] = useState<"ideas" | "comments">("ideas");

  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [comments, setComments] = useState<CommentSummary[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedStatus, setAdvancedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const [modCommentId, setModCommentId] = useState<string | null>(null);
  const [modReason, setModReason] = useState("");
  const [commentMsg, setCommentMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin-secret");
    if (stored) {
      requestAnimationFrame(() => {
        setSecret(stored);
        setAuthenticated(true);
      });
    }
  }, []);

  const fetchIdeas = useCallback(async () => {
    requestAnimationFrame(() => setLoadingIdeas(true));
    try {
      const res = await fetch("/api/ideas?limit=100");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIdeas(data.ideas ?? []);
    } catch {} finally {
      setLoadingIdeas(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    requestAnimationFrame(() => setLoadingComments(true));
    try {
      const res = await fetch("/api/ideas?limit=100");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allComments: CommentSummary[] = [];
      for (const idea of data.ideas ?? []) {
        const cr = await fetch(`/api/ideas/${idea.id}/comments`);
        if (cr.ok) {
          const cd = await cr.json();
          for (const c of cd.comments ?? []) {
            allComments.push({
              id: c.id,
              text: c.text,
              status: c.status ?? "VISIBLE",
              ideaId: idea.id,
              createdAt: c.createdAt,
            });
            for (const r of c.replies ?? []) {
              allComments.push({
                id: r.id,
                text: r.text,
                status: r.status ?? "VISIBLE",
                ideaId: idea.id,
                createdAt: r.createdAt,
              });
            }
          }
        }
      }
      setComments(allComments);
    } catch {} finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated && tab === "ideas") requestAnimationFrame(() => fetchIdeas());
    if (authenticated && tab === "comments") requestAnimationFrame(() => fetchComments());
  }, [authenticated, tab, fetchIdeas, fetchComments]);

  const getAdminSecret = () => secret || localStorage.getItem("admin-secret") || "";

  const handleLogin = () => {
    setAuthError(false);
    localStorage.setItem("admin-secret", secret);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-secret");
    setSecret("");
    setAuthenticated(false);
    setIdeas([]);
    setComments([]);
  };

  const executeStatusChange = async (
    ideaId: string,
    newStatus: string,
    note: string,
    force = false
  ) => {
    setStatusMsg("");
    try {
      const res = await fetch(`/api/admin/ideas/${ideaId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": getAdminSecret(),
        },
        body: JSON.stringify({ status: newStatus, note, force }),
      });
      if (res.ok) {
        setStatusMsg(t("statusUpdated"));
        setEditingIdea(null);
        setPendingAction(null);
        setAdvancedOpen(false);
        setAdvancedStatus("");
        setStatusNote("");
        fetchIdeas();
      } else {
        const data = await res.json();
        setStatusMsg(data.error || "Error");
      }
    } catch {
      setStatusMsg("Error");
    }
  };

  const handleQuickAction = (ideaId: string, action: QuickAction) => {
    if (action.to === "REJECTED") {
      setPendingAction(action);
    } else {
      executeStatusChange(ideaId, action.to, tqa(action.labelKey));
    }
  };

  const confirmQuickAction = (ideaId: string) => {
    if (!pendingAction || !statusNote) return;
    executeStatusChange(ideaId, pendingAction.to, statusNote);
  };

  const handleAdvancedChange = (ideaId: string) => {
    if (!advancedStatus || !statusNote) return;
    executeStatusChange(ideaId, advancedStatus, statusNote, true);
  };

  const handleCommentModeration = async (commentId: string, action: "VISIBLE" | "HIDDEN") => {
    if (!modReason) return;
    setCommentMsg("");
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": getAdminSecret(),
        },
        body: JSON.stringify({ status: action, reason: modReason }),
      });
      if (res.ok) {
        setCommentMsg(t("commentModerated"));
        setModCommentId(null);
        setModReason("");
        fetchComments();
      } else {
        const data = await res.json();
        setCommentMsg(data.error || "Error");
      }
    } catch {
      setCommentMsg("Error");
    }
  };

  if (!authenticated) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-600">{t("description")}</p>

        <div className="mt-6 max-w-sm space-y-3">
          <div>
            <label htmlFor="admin-secret" className="block text-sm font-medium text-slate-700">
              {t("secretLabel")}
            </label>
            <input
              id="admin-secret"
              type="password"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setAuthError(false); }}
              placeholder={t("secretPlaceholder")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleLogin}
            className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            {t("login")}
          </button>
          {authError && <p role="alert" className="text-sm text-red-600">{t("authFailed")}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          {t("title")}
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-500 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          {t("logout")}
        </button>
      </div>

      <div className="mt-4 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab("ideas")}
          className={`px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700 ${
            tab === "ideas"
              ? "border-b-2 border-blue-700 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t("ideasTab")}
        </button>
        <button
          onClick={() => setTab("comments")}
          className={`px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700 ${
            tab === "comments"
              ? "border-b-2 border-blue-700 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t("commentsTab")}
        </button>
      </div>

      {tab === "ideas" && (
        <div className="mt-4">
          {statusMsg && (
            <p role="status" className={`mb-3 text-sm ${statusMsg === t("statusUpdated") ? "text-green-700" : "text-red-600"}`}>
              {statusMsg}
            </p>
          )}
          {loadingIdeas ? (
            <div className="flex items-center gap-2 text-sm text-slate-400" aria-busy="true" role="status">
              {t("loadingIdeas")}
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-2 font-medium w-10"></th>
                    <th className="py-2 pr-4 font-medium">{t("ideaTitle")}</th>
                    <th className="py-2 pr-4 font-medium">{t("ideaCurrentStatus")}</th>
                    <th className="py-2 font-medium">{t("changeStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ideas.map((idea) => (
                    <tr key={idea.id}>
                      <td className="py-2 pr-2">
                        {idea.firstImage ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded">
                            <Image
                              src={idea.firstImage.url}
                              alt={idea.firstImage.alt || idea.title}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded bg-slate-100" />
                        )}
                      </td>
                      <td className="py-2 pr-4 max-w-[300px] truncate">{idea.title}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={statusToBadgeVariant(idea.status)}>
                          {ts(idea.status as Parameters<typeof ts>[0])}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {editingIdea === idea.id ? (
                          <div className="space-y-2">
                            {pendingAction && pendingAction.to === "REJECTED" ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  aria-label={t("statusNoteLabel")}
                                  value={statusNote}
                                  onChange={(e) => setStatusNote(e.target.value)}
                                  placeholder={t("rejectionNotePlaceholder")}
                                  className="w-56 rounded-md border border-red-300 px-2 py-1 text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                  onClick={() => confirmQuickAction(idea.id)}
                                  disabled={!statusNote}
                                  className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {tqa("reject")}
                                </button>
                                <button
                                  onClick={() => { setPendingAction(null); setStatusNote(""); }}
                                  aria-label="Cancel"
                                  className="text-xs text-slate-500 hover:text-slate-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : advancedOpen ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  aria-label={t("changeStatus")}
                                  value={advancedStatus}
                                  onChange={(e) => setAdvancedStatus(e.target.value)}
                                  className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                                >
                                  <option value="">—</option>
                                  {ALL_STATUSES.filter((s) => s !== idea.status).map((s) => (
                                    <option key={s} value={s}>
                                      {ts(s as Parameters<typeof ts>[0])}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  aria-label={t("statusNoteLabel")}
                                  value={statusNote}
                                  onChange={(e) => setStatusNote(e.target.value)}
                                  placeholder={t("statusNotePlaceholder")}
                                  className="w-48 rounded-md border border-slate-300 px-2 py-1 text-xs"
                                />
                                <button
                                  onClick={() => handleAdvancedChange(idea.id)}
                                  disabled={!advancedStatus || !statusNote}
                                  className="rounded-md bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-800 disabled:opacity-50"
                                >
                                  {t("updateStatus")}
                                </button>
                                <button
                                  onClick={() => { setAdvancedOpen(false); setAdvancedStatus(""); setStatusNote(""); }}
                                  aria-label="Cancel"
                                  className="text-xs text-slate-500 hover:text-slate-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-1.5">
                                  {QUICK_ACTIONS[idea.status as Status]?.map((action) => (
                                    <button
                                      key={action.to}
                                      onClick={() => handleQuickAction(idea.id, action)}
                                      className={`rounded-md px-2 py-1 text-xs font-medium text-white transition ${
                                        action.variant === "danger"
                                          ? "bg-red-600 hover:bg-red-700"
                                          : "bg-blue-700 hover:bg-blue-800"
                                      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700`}
                                    >
                                      {tqa(action.labelKey)}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => setAdvancedOpen(true)}
                                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                                >
                                  {t("advancedOverride")}
                                </button>
                                <button
                                  onClick={() => { setEditingIdea(null); setStatusNote(""); }}
                                  aria-label="Cancel"
                                  className="ml-1 text-xs text-slate-500 hover:text-slate-700"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingIdea(idea.id)}
                            className="text-xs font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
                          >
                            {t("changeStatus")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "comments" && (
        <div className="mt-4">
          {commentMsg && (
            <p role="status" className={`mb-3 text-sm ${commentMsg === t("commentModerated") ? "text-green-700" : "text-red-600"}`}>
              {commentMsg}
            </p>
          )}
          {loadingComments ? (
            <div className="flex items-center gap-2 text-sm text-slate-400" aria-busy="true" role="status">
              {t("loadingComments")}
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-900 line-clamp-2">{comment.text}</p>
                    <Badge variant={comment.status === "HIDDEN" ? "rejected" : "submitted"}>
                      {comment.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {t("commentIdeaId")}: {comment.ideaId.slice(0, 8)}… · {new Date(comment.createdAt).toLocaleDateString()}
                  </div>

                  {modCommentId === comment.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        aria-label={t("moderationReasonLabel")}
                        value={modReason}
                        onChange={(e) => setModReason(e.target.value)}
                        placeholder={t("moderationReasonPlaceholder")}
                        className="w-56 rounded-md border border-slate-300 px-2 py-1 text-xs"
                      />
                      {comment.status === "VISIBLE" ? (
                        <button
                          onClick={() => handleCommentModeration(comment.id, "HIDDEN")}
                          disabled={!modReason}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {t("hideComment")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCommentModeration(comment.id, "VISIBLE")}
                          disabled={!modReason}
                          className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {t("restoreComment")}
                        </button>
                      )}
                      <button
                        onClick={() => { setModCommentId(null); setModReason(""); }}
                        aria-label="Cancel"
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setModCommentId(comment.id)}
                      className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
                    >
                      {comment.status === "VISIBLE" ? t("hideComment") : t("restoreComment")}
                    </button>
                  )}
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-slate-500">{t("noCommentsFound")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
