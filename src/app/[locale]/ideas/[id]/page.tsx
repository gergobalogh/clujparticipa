"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import { VOTE_ELIGIBLE_STATUSES, SUPPORT_LABEL_STATUSES } from "@/lib/transitions";
import { MapPickerLoader } from "@/components/map/map-picker-loader";
import { IdeaCarousel, CarouselImage } from "@/components/ideas/idea-carousel";
import { VotingCountdown } from "@/components/ideas/voting-countdown";
import { getOrCreateParticipantToken } from "@/lib/client-participant";
import Image from "next/image";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};

type Comment = {
  id: string;
  text: string;
  participantHash: string;
  createdAt: string;
  parentId: string | null;
  replies?: Comment[];
};

type FeasibilityNote = {
  id: string;
  responseText: string;
  department: string | null;
  estimatedCostRonMin: number | null;
  estimatedCostRonMax: number | null;
  author: string;
  createdAt: string;
};

type ProgressUpdate = {
  id: string;
  text: string;
  imageUrl: string | null;
  author: string;
  createdAt: string;
};

type VotingConfigData = {
  startsAt: string;
  endsAt: string;
  label: string | null;
  isOpen: boolean;
};

type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  supportCount: number;
  commentCount: number;
  statusChanges: StatusChange[];
  images?: CarouselImage[];
  feasibilityNote: FeasibilityNote | null;
  progressUpdates: ProgressUpdate[];
};

export default function IdeaDetailPage() {
  const t = useTranslations("IdeaDetail");
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const ts = useTranslations("Statuses");
  const ta = useTranslations("Auth");
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [voteError, setVoteError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [notifyOnVote, setNotifyOnVote] = useState(false);
  const [votingConfig, setVotingConfig] = useState<VotingConfigData | null>(null);

  const refreshComments = async () => {
    try {
      const res = await fetch(`/api/ideas/${id}/comments`);
      if (res.ok) {
        const d = await res.json();
        setComments(d.comments ?? []);
      }
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ideas/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setIdea(data);
        setSupportCount(data?.supportCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetch(`/api/ideas/${id}/comments`)
      .then((r) => r.ok ? r.json() : { comments: [] })
      .then((data) => {
        if (!cancelled) setComments(data.comments ?? []);
      })
      .catch(() => {});

    fetch("/api/voting-config")
      .then((r) => r.ok ? r.json() : { config: null })
      .then((data) => {
        if (!cancelled) setVotingConfig(data.config ?? null);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [id]);

  const handleVote = async () => {
    if (!session?.user) {
      signIn();
      return;
    }
    setVoteError("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const res = await fetch(`/api/ideas/${id}/vote`, {
        method: "POST",
        headers,
        body: JSON.stringify({ notifyOnStatusChange: notifyOnVote }),
      });
      if (res.ok) {
        const data = await res.json();
        setSupported(true);
        setSupportCount(data.supportCount);
      } else if (res.status === 409) {
        setSupported(true);
      } else if (res.status === 403) {
        setVoteError(t("notOpenForVoting"));
      } else {
        setVoteError(t("supportButton"));
      }
    } catch {
      setVoteError(t("supportButton"));
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    setCommentError("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!session?.user) {
      headers["x-participant-token"] = getOrCreateParticipantToken();
    }
    try {
      const res = await fetch(`/api/ideas/${id}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        await refreshComments();
      } else {
        setCommentError("Error");
      }
    } catch {
      setCommentError("Error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmittingComment(true);
    setCommentError("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!session?.user) {
      headers["x-participant-token"] = getOrCreateParticipantToken();
    }
    try {
      const res = await fetch(`/api/ideas/${id}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: replyText, parentId }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyTo(null);
        await refreshComments();
      } else {
        setCommentError("Error");
      }
    } catch {
      setCommentError("Error");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-100" />
          <div className="h-24 w-full rounded bg-slate-100" />
        </div>
      </main>
    );
  }

  if (loadError || !idea) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <p role="alert" className="text-slate-600">{t("title")} — not found</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          {idea.title}
        </h1>
        <Badge variant={statusToBadgeVariant(idea.status)}>
          {ts(idea.status as Parameters<typeof ts>[0])}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
        <span>{t("category")}: {tc(idea.category as Parameters<typeof tc>[0])}</span>
        <span>{t("district")}: {td(idea.district as Parameters<typeof td>[0])}</span>
        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>

      {idea.images && idea.images.length > 0 && (
        <div className="mt-5">
          <IdeaCarousel images={idea.images} />
        </div>
      )}

      <p className="mt-4 whitespace-pre-line text-slate-700">{idea.description}</p>

      {/* Map */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700">{t("location")}</h3>
        <div className="mt-2">
          <MapPickerLoader
            latitude={idea.latitude}
            longitude={idea.longitude}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Rejection note */}
      {idea.status === "REJECTED" && (() => {
        const rejectionChange = [...idea.statusChanges]
          .reverse()
          .find((sc) => sc.toStatus === "REJECTED");
        return rejectionChange ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">{t("notEligible")}</p>
            <p className="mt-1 text-sm text-red-700">{t("rejectionNote")}: {rejectionChange.note}</p>
          </div>
        ) : null;
      })()}

      {/* Feasibility note */}
      {idea.feasibilityNote && (
        <div className="mt-6 rounded-md border-l-4 border-blue-700 bg-blue-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-blue-900">{t("feasibilityHeading")}</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-800">
            {idea.feasibilityNote.responseText}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            {idea.feasibilityNote.department && (
              <span>{t("feasibilityDepartment")}: {idea.feasibilityNote.department}</span>
            )}
            {(idea.feasibilityNote.estimatedCostRonMin != null || idea.feasibilityNote.estimatedCostRonMax != null) && (
              <span>
                {t("feasibilityCostRange")}: RON{" "}
                {idea.feasibilityNote.estimatedCostRonMin != null && idea.feasibilityNote.estimatedCostRonMax != null
                  ? `${idea.feasibilityNote.estimatedCostRonMin.toLocaleString()} – ${idea.feasibilityNote.estimatedCostRonMax.toLocaleString()}`
                  : idea.feasibilityNote.estimatedCostRonMin != null
                    ? `${idea.feasibilityNote.estimatedCostRonMin.toLocaleString()}+`
                    : `– ${idea.feasibilityNote.estimatedCostRonMax!.toLocaleString()}`}
              </span>
            )}
            <span>{t("feasibilityAuthor")} · {new Date(idea.feasibilityNote.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Progress updates */}
      {idea.progressUpdates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">{t("progressUpdatesHeading")}</h3>
          <ol className="mt-3 space-y-3 border-l-2 border-blue-200 pl-4">
            {idea.progressUpdates.map((update) => (
              <li key={update.id} className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                <p className="text-sm text-slate-800">{update.text}</p>
                {update.imageUrl && (
                  <div className="relative mt-2 h-48 w-full overflow-hidden rounded-md">
                    <Image
                      src={update.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 640px"
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(update.createdAt))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Vote */}
      {VOTE_ELIGIBLE_STATUSES.includes(idea.status as typeof VOTE_ELIGIBLE_STATUSES[number]) && (
      <div className="mt-8 rounded-md border border-slate-200 px-4 py-3">
        <style>{`
          @keyframes countPop {
            0% { transform: scale(1); }
            40% { transform: scale(1.35); }
            100% { transform: scale(1); }
          }
          @keyframes checkIn {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .vote-count-pop { animation: countPop 0.4s ease-out; }
          .vote-check-in { animation: checkIn 0.35s ease-out; }
        `}</style>
        {idea.status === "IN_VOTING" && votingConfig && (
          <div className="mb-2">
            <VotingCountdown endsAt={votingConfig.endsAt} />
          </div>
        )}
        {session?.user ? (
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleVote}
                disabled={supported}
                aria-pressed={supported}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  supported
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
              >
                {supported && (
                  <svg
                    className="h-4 w-4 vote-check-in"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {supported
                  ? t("alreadySupported")
                  : SUPPORT_LABEL_STATUSES.includes(idea.status as typeof SUPPORT_LABEL_STATUSES[number])
                    ? t("backThisIdea")
                    : t("voteButton")
                }
              </button>
              <span
                key={supportCount}
                className={`text-sm text-slate-600 ${supported ? "vote-count-pop" : ""}`}
              >
                {t("supportCount", { count: supportCount })}
              </span>
            </div>
            {!supported ? (
              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyOnVote}
                  onChange={(e) => setNotifyOnVote(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{t("notifyVoteLabel")}</span>
              </label>
            ) : notifyOnVote ? (
              <p className="mt-2 text-sm text-slate-500">{t("notifyVoteConfirm")}</p>
            ) : null}
          </div>
        ) : (
          <div>
            <button
              onClick={() => signIn()}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              {ta("signInToVote")}
            </button>
            <p className="mt-1.5 text-sm text-slate-500">{ta("loginRequiredNote")}</p>
          </div>
        )}
        <p className="mt-2 text-sm text-slate-500">{t("nonBinding")}</p>
        {voteError && <p role="alert" className="mt-1 text-sm text-red-600">{voteError}</p>}
      </div>
      )}

      {/* Status timeline */}
      {idea.statusChanges.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">{t("statusTimeline")}</h2>
          <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-4">
            {idea.statusChanges.map((sc) => (
              <li key={sc.id} className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />
                <div className="text-sm">
                  <span className="font-medium text-slate-900">
                    {sc.fromStatus ? ts(sc.fromStatus as Parameters<typeof ts>[0]) : "—"}
                  </span>
                  {" → "}
                  <span className="font-medium text-blue-700">
                    {ts(sc.toStatus as Parameters<typeof ts>[0])}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{sc.note}</p>
                <p className="text-xs text-slate-400">
                  {new Date(sc.createdAt).toLocaleDateString()} · {sc.changedBy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Comments */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("commentsTitle")} ({t("commentCount", { count: comments.length })})
        </h2>

        {commentError && <p role="alert" className="mt-2 text-sm text-red-600">{commentError}</p>}

        {/* Add comment form */}
        <form onSubmit={handleComment} className="mt-4">
          <label htmlFor="new-comment" className="block text-sm font-medium text-slate-700 sr-only">
            {t("addComment")}
          </label>
          <textarea
            id="new-comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("commentPlaceholder")}
            rows={3}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="mt-2 inline-flex items-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50"
          >
            {submittingComment ? "…" : t("submitComment")}
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("noComments")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-md border border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-900">{comment.text}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{comment.participantHash.slice(0, 8)}…</span>
                </div>

                {/* Reply button */}
                {replyTo !== comment.id && (
                  <button
                    onClick={() => setReplyTo(comment.id)}
                    className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    {t("replyTo")}
                  </button>
                )}

                {/* Reply form */}
                {replyTo === comment.id && (
                  <div className="mt-2">
                    <label htmlFor={`reply-${comment.id}`} className="sr-only">
                      {t("replyTo")}
                    </label>
                    <textarea
                      id={`reply-${comment.id}`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("replyPlaceholder")}
                      rows={2}
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={submittingComment || !replyText.trim()}
                        className="inline-flex items-center rounded-md bg-blue-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
                      >
                        {submittingComment ? "…" : t("submitReply")}
                      </button>
                      <button
                        onClick={() => { setReplyTo(null); setReplyText(""); }}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        {t("cancelReply")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <ul className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
                    {comment.replies.map((reply) => (
                      <li key={reply.id}>
                        <p className="text-sm text-slate-800">{reply.text}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                          <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{reply.participantHash.slice(0, 8)}…</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
