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
import { IdeaPipeline } from "@/components/ideas/idea-pipeline";
import { StatusChangeTimeline } from "@/components/ideas/status-change-timeline";
import { VotingCountdown } from "@/components/ideas/voting-countdown";
import { mapStatusChangesToTimelineEntries } from "@/lib/timeline-mapping";
import { getOrCreateParticipantToken } from "@/lib/client-participant";
import { computePipelineStages, resolveExceptionType, findRejectionChange, parseMergeNote, parseReturnNote } from "@/lib/pipeline-computation";
import { ExceptionState } from "@/components/ideas/exception-state";
import { detectStalledIdea } from "@/lib/stalled-detector";
import { useNotificationOptIn } from "@/hooks/use-notification-opt-in";
import type { Status } from "@prisma/client";
import type { StatusChange } from "@/lib/types";
import Image from "next/image";

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
  const tp = useTranslations("Pipeline");
  const ttl = useTranslations("Timeline");
  const tn = useTranslations("Notification");
  const { data: session } = useSession();
  const { id } = useParams<{ id: string }>();
  const { showInAppFallback } = useNotificationOptIn();

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
  const [lastSeenStatus, setLastSeenStatus] = useState<string | null>(null);

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

  // Read last-seen status from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${id}:lastSeenStatus`);
    if (stored) setLastSeenStatus(stored);
  }, [id]);

  // Update last-seen status in localStorage when idea loads
  useEffect(() => {
    if (idea?.status) {
      localStorage.setItem(`${id}:lastSeenStatus`, idea.status);
    }
  }, [id, idea?.status]);

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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-paper-muted" />
          <div className="h-4 w-1/3 rounded bg-paper-muted" />
          <div className="h-24 w-full rounded bg-paper-muted" />
        </div>
      </main>
    );
  }

  if (loadError || !idea) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <p role="alert" className="text-ink-muted">{t("title")} — not found</p>
      </main>
    );
  }

  const showVoteSection = VOTE_ELIGIBLE_STATUSES.includes(idea.status as typeof VOTE_ELIGIBLE_STATUSES[number]);

  // In-app notification fallback: show status change indicator when
  // browser notifications are denied and status changed since last visit
  const statusChangedSinceLastVisit =
    lastSeenStatus !== null && idea.status !== lastSeenStatus;
  const showStatusChangeFallback =
    showInAppFallback && statusChangedSinceLastVisit;

  const ideaStatus = idea.status as Status;
  const pipelineStages = computePipelineStages({
    status: ideaStatus,
    createdAt: idea.createdAt,
    statusChanges: idea.statusChanges,
  });
  const exceptionType = resolveExceptionType(ideaStatus, idea.statusChanges);
  const rejectionChange = exceptionType ? findRejectionChange(idea.statusChanges) : null;
  const exceptionState = exceptionType ?? undefined;
  const lastStatusChangeDate = idea.statusChanges.length > 0
    ? new Date(idea.statusChanges[idea.statusChanges.length - 1].createdAt)
    : new Date(idea.createdAt);
  const stalledInfo = detectStalledIdea(
    ideaStatus,
    lastStatusChangeDate
  );
  const stalledLabel = stalledInfo.isStalled
    ? `${tp("waitingFor")}: ${stalledInfo.waitingForLabel}`
    : undefined;
  const stalledDays = stalledInfo.isStalled
    ? stalledInfo.daysSinceLastChange
    : undefined;

  // Compute ExceptionState component props from the detected exception type
  const exceptionStateProps = exceptionType && rejectionChange ? (() => {
    if (exceptionType === "MERGED") {
      const { parentIdeaId, parentIdeaTitle } = parseMergeNote(rejectionChange.note);
      return {
        exceptionType: "MERGED" as const,
        reason: rejectionChange.note,
        parentIdeaId,
        parentIdeaTitle,
      };
    }
    if (exceptionType === "RETURNED") {
      const feedback = parseReturnNote(rejectionChange.note);
      return {
        exceptionType: "RETURNED" as const,
        reason: feedback || null,
        resubmitUrl: `/ideas/new?from=${idea.id}`,
      };
    }
    // Default REJECTED
    return {
      exceptionType: "REJECTED" as const,
      reason: rejectionChange.note || null,
      resubmitUrl: `/ideas/new?from=${idea.id}`,
      similarIdeasUrl: `/ideas?category=${idea.category}`,
      hasSimilarIdeas: true,
    };
  })() : null;

  const timelineEntries = mapStatusChangesToTimelineEntries(idea.statusChanges);

  const voteSection = showVoteSection ? (
    <div className="rounded-sm border border-ink/10 px-4 py-4 bg-paper">
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
              className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink ${
                supported
                  ? "bg-civic-teal-light text-civic-teal"
                  : "bg-ink text-paper hover:bg-ink/90"
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
              className={`text-sm text-ink-muted ${supported ? "vote-count-pop" : ""}`}
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
                className="h-4 w-4 rounded-sm border-ink/20 text-ink focus:ring-ink"
              />
              <span className="text-sm text-ink-muted">{t("notifyVoteLabel")}</span>
            </label>
          ) : notifyOnVote ? (
            <p className="mt-2 text-sm text-ink-muted">{t("notifyVoteConfirm")}</p>
          ) : null}
        </div>
      ) : (
        <div>
          <button
            onClick={() => signIn()}
            className="inline-flex items-center rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
          >
            {ta("signInToVote")}
          </button>
          <p className="mt-1.5 text-sm text-ink-muted">{ta("loginRequiredNote")}</p>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-muted">{t("nonBinding")}</p>
      {voteError && <p role="alert" className="mt-1 text-sm text-red-600">{voteError}</p>}
    </div>
  ) : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* In-app notification fallback when browser notifications are denied */}
      {showStatusChangeFallback && (
        <div
          data-testid="notification-fallback"
          className="mb-4 rounded-sm border-l-4 border-civic-teal bg-civic-teal-light/30 px-4 py-3"
        >
          <p className="text-sm font-medium text-ink">
            {tn("statusChangedBanner", { stage: ts(idea.status as Parameters<typeof ts>[0]) })}
          </p>
        </div>
      )}
      {/* Mobile: vote section near top */}
      <div className="lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl leading-tight">
            {idea.title}
          </h1>
          <Badge variant={statusToBadgeVariant(idea.status)}>
            {ts(idea.status as Parameters<typeof ts>[0])}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
          <span className="uppercase tracking-wide font-semibold">{tc(idea.category as Parameters<typeof tc>[0])}</span>
          <span className="text-ink/20">·</span>
          <span className="uppercase tracking-wide font-semibold">{td(idea.district as Parameters<typeof td>[0])}</span>
          <span className="text-ink/20">·</span>
          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4">
          <IdeaPipeline
            stages={pipelineStages}
            exceptionState={exceptionState}
            stalledLabel={stalledLabel}
            stalledDays={stalledDays}
            isMobile={true}
          />
        </div>

        {/* Vote section on mobile near top */}
        {voteSection && <div className="mt-4">{voteSection}</div>}
      </div>

      {/* Desktop layout with action rail */}
      <div className="mt-0 lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
        <div>
          {/* Desktop header (hidden on mobile, shown on desktop) */}
          <div className="hidden lg:block">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl leading-tight">
                {idea.title}
              </h1>
              <Badge variant={statusToBadgeVariant(idea.status)}>
                {ts(idea.status as Parameters<typeof ts>[0])}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
              <span className="uppercase tracking-wide font-semibold">{tc(idea.category as Parameters<typeof tc>[0])}</span>
              <span className="text-ink/20">·</span>
              <span className="uppercase tracking-wide font-semibold">{td(idea.district as Parameters<typeof td>[0])}</span>
              <span className="text-ink/20">·</span>
              <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="mt-4">
              <IdeaPipeline
                stages={pipelineStages}
                exceptionState={exceptionState}
                stalledLabel={stalledLabel}
                stalledDays={stalledDays}
                isMobile={false}
              />
            </div>
          </div>

          {idea.images && idea.images.length > 0 && (
            <div className="mt-5">
              <IdeaCarousel images={idea.images} />
            </div>
          )}

          <p className="mt-4 whitespace-pre-line text-ink leading-relaxed">{idea.description}</p>

          {/* Exception state: MERGED / RETURNED / REJECTED */}
          {exceptionStateProps && (
            <div className="mt-4">
              <ExceptionState {...exceptionStateProps} />
            </div>
          )}

          {/* Feasibility note */}
          {idea.feasibilityNote && (
            <div className="mt-6 rounded-sm border-l-4 border-civic-blue bg-civic-blue-light/30 px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">{t("feasibilityHeading")}</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-ink leading-relaxed">
                {idea.feasibilityNote.responseText}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
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
              <h3 className="text-sm font-semibold text-ink">{t("progressUpdatesHeading")}</h3>
              <ol className="mt-3 space-y-3 border-l-2 border-civic-teal/30 pl-4">
                {idea.progressUpdates.map((update) => (
                  <li key={update.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-paper bg-civic-teal" />
                    <p className="text-sm text-ink">{update.text}</p>
                    {update.imageUrl && (
                      <div className="relative mt-2 h-48 w-full overflow-hidden rounded-sm">
                        <Image
                          src={update.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 640px"
                        />
                      </div>
                    )}
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(update.createdAt))}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Map */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{t("location")}</h3>
            <div className="mt-2">
              <MapPickerLoader
                latitude={idea.latitude}
                longitude={idea.longitude}
                onChange={() => {}}
              />
            </div>
          </div>

          {/* Status timeline */}
          <div className="mt-8">
            <StatusChangeTimeline
              entries={timelineEntries}
              noUpdatesLabel={ttl("noUpdatesYet")}
              viewHistoryLabel={ttl("viewFullHistory")}
            />
          </div>

          {/* Comments */}
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {t("commentsTitle")} ({t("commentCount", { count: comments.length })})
            </h2>

            {commentError && <p role="alert" className="mt-2 text-sm text-red-600">{commentError}</p>}

            {/* Add comment form */}
            <form onSubmit={handleComment} className="mt-4">
              <label htmlFor="new-comment" className="block text-sm font-medium text-ink sr-only">
                {t("addComment")}
              </label>
              <textarea
                id="new-comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("commentPlaceholder")}
                rows={3}
                className="block w-full rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="mt-2 inline-flex items-center rounded-sm bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
              >
                {submittingComment ? t("loading") : t("submitComment")}
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">{t("noComments")}</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="border-b border-ink/8 px-0 py-3 last:border-b-0">
                    <p className="text-sm text-ink">{comment.text}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="opacity-50">{comment.participantHash.slice(0, 8)}…</span>
                    </div>

                    {/* Reply button */}
                    {replyTo !== comment.id && (
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="mt-2 text-xs font-medium text-civic-blue hover:text-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
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
                          className="block w-full rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                        />
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={submittingComment || !replyText.trim()}
                            className="inline-flex items-center rounded-sm bg-ink px-3 py-1 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
                          >
                            {submittingComment ? "…" : t("submitReply")}
                          </button>
                          <button
                            onClick={() => { setReplyTo(null); setReplyText(""); }}
                            className="text-xs text-ink-muted hover:text-ink"
                          >
                            {t("cancelReply")}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <ul className="mt-3 space-y-2 border-l-2 border-ink/8 pl-4">
                        {comment.replies.map((reply) => (
                          <li key={reply.id}>
                            <p className="text-sm text-ink">{reply.text}</p>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                              <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                              <span>·</span>
                              <span className="opacity-50">{reply.participantHash.slice(0, 8)}…</span>
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
        </div>

        {/* Desktop action rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {voteSection}
            <div className="rounded-sm border border-ink/8 px-4 py-3 bg-paper">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{ts(idea.status as Parameters<typeof ts>[0])}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{t("supportCount", { count: supportCount })}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
