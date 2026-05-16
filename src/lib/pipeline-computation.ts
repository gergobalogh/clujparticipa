/** Pipeline data computation — pure functions transforming idea data into PipelineStage[].
 *
 * Status is the authoritative signal for exception types (D23+ redesign).
 * No more note-prefix detection for MERGED/RETURNED — the status itself
 * tells you the exception type. parseMergeNote/parseReturnNote retained
 * for extracting detail (parent ID, feedback text) from notes.
 */
import type { Status } from "@prisma/client";
import { PIPELINE_STAGES, getStageIndex, isCurrentStage } from "./pipeline-stages";
import { TERMINAL_STATUSES } from "./transitions";
import { normalizeStatus } from "./status";
import type { PipelineStage } from "@/components/ideas/pipeline-track";
import type { StatusChange } from "./types";

export type IdeaData = {
  status: Status;
  createdAt: string;
  statusChanges: StatusChange[];
};

/** Find the most recent date a status change arrived at the given stage. */
function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function findStageDate(
  stage: Status,
  statusChanges: StatusChange[],
  ideaCreatedAt: string
): string | null {
  if (stage === "SUBMITTED") {
    return formatDate(ideaCreatedAt);
  }
  const matching = statusChanges.filter(
    (sc) => sc.toStatus != null && sc.toStatus === stage
  );
  if (matching.length === 0) {
    return null;
  }
  const mostRecent = matching[matching.length - 1];
  return mostRecent.createdAt ? formatDate(mostRecent.createdAt) : null;
}

/** For terminal-status ideas, find the highest forward pipeline stage reached before exit.
 * This allows the pipeline to show progress up to the point of exit. */
function findLastForwardStage(statusChanges: StatusChange[]): Status | null {
  const forwardStatuses = new Set<Status>(PIPELINE_STAGES);
  let lastForward: Status | null = null;
  for (const sc of statusChanges) {
    if (forwardStatuses.has(sc.toStatus as Status)) {
      lastForward = sc.toStatus as Status;
    }
  }
  return lastForward;
}

/** Determine the exception state from the idea status.
 * Returns undefined for forward-pipeline statuses.
 * For terminal statuses, returns the exception type directly. */
export function getExceptionState(
  status: Status
): "REJECTED" | "NEEDS_REVISION" | "MERGED" | "WITHDRAWN" | undefined {
  if (status === "REJECTED") return "REJECTED";
  if (status === "NEEDS_REVISION") return "NEEDS_REVISION";
  if (status === "MERGED") return "MERGED";
  if (status === "WITHDRAWN") return "WITHDRAWN";
  return undefined;
}

/** Find the most recent StatusChange where toStatus is a terminal status. */
export function findTerminalChange(
  statusChanges: StatusChange[]
): StatusChange | null {
  const terminalChanges = statusChanges.filter(
    (sc) => TERMINAL_STATUSES.includes(sc.toStatus as Status)
  );
  if (terminalChanges.length === 0) return null;
  return terminalChanges[terminalChanges.length - 1];
}

/** @deprecated Use getExceptionState(status) directly — status is authoritative. */
export function resolveExceptionType(
  status: Status,
  _statusChanges: StatusChange[]
): "REJECTED" | "NEEDS_REVISION" | "MERGED" | "WITHDRAWN" | undefined {
  return getExceptionState(status);
}

/** Backward-compatible alias for findTerminalChange. */
export const findRejectionChange = findTerminalChange;

/** Parse a MERGED note to extract parent idea ID and optional title.
 * Retained for extracting detail from notes, not for type detection. */
export function parseMergeNote(note: string): {
  parentIdeaId: string | null;
  parentIdeaTitle: string | null;
} {
  const content = note.replace(/^\[MERGED\]\s*/i, "").trim();
  if (!content) return { parentIdeaId: null, parentIdeaTitle: null };

  const hashMatch = content.match(/#([a-zA-Z0-9]+)/);
  let rawId: string | null = null;
  let idEndIndex: number | null = null;

  if (hashMatch) {
    rawId = hashMatch[1];
    idEndIndex = (hashMatch.index ?? 0) + hashMatch[0].length;
  } else {
    const bareMatch = content.match(/\b(?:with|into|to)\s+([a-zA-Z0-9]{6,})/);
    if (bareMatch) {
      rawId = bareMatch[1];
      idEndIndex = (bareMatch.index ?? 0) + bareMatch[0].length;
    } else {
      const trailingMatch = content.match(/\b([a-zA-Z0-9]{6,})\s*$/);
      if (trailingMatch) {
        rawId = trailingMatch[1];
        idEndIndex = (trailingMatch.index ?? 0) + trailingMatch[0].length;
      }
    }
  }

  if (!rawId) return { parentIdeaId: null, parentIdeaTitle: null };

  let parentIdeaTitle: string | null = null;
  if (idEndIndex !== null) {
    const afterId = content.slice(idEndIndex).trim();
    const titleMatch = afterId.match(/^[-–—]\s*(.+)/);
    if (titleMatch) {
      parentIdeaTitle = titleMatch[1].trim() || null;
    }
  }

  return { parentIdeaId: rawId, parentIdeaTitle };
}

/** Extract feedback text from a NEEDS_REVISION note.
 * Strips the "[RETURNED]" prefix (legacy format) and trims whitespace. */
export function parseReturnNote(note: string): string {
  return note.replace(/^\[RETURNED\]\s*/i, "").trim();
}

/** Resolve the effective current status for pipeline stage computation.
 * For terminal-status ideas, uses the last forward pipeline stage reached.
 * Normalizes legacy statuses (UNDER_REVIEW/ELIGIBLE -> IN_VOTING). */
function resolveEffectiveStatus(idea: IdeaData): Status {
  const normalized = normalizeStatus(idea.status);
  if (TERMINAL_STATUSES.includes(normalized)) {
    const lastForward = findLastForwardStage(idea.statusChanges);
    return lastForward ?? "SUBMITTED";
  }
  return normalized;
}

/** Transform idea data into a PipelineStage[] array for PipelineTrack rendering.
 *
 * Maps each of the 6 forward PIPELINE_STAGES to a PipelineStage with:
 * - reached: whether the idea has reached or passed this stage
 * - current: whether this is the idea's current status
 * - date: the date the stage was reached (from statusChanges or createdAt)
 * - label: the status key (used by the component to look up translations)
 *
 * For terminal-status ideas, no stage is marked as "current" since the idea
 * is no longer in the forward pipeline. Stages reached before exit are
 * still marked as "reached".
 */
export function computePipelineStages(idea: IdeaData): PipelineStage[] {
  const effectiveStatus = resolveEffectiveStatus(idea);
  const isTerminal = TERMINAL_STATUSES.includes(normalizeStatus(idea.status));

  return PIPELINE_STAGES.map((stage) => {
    const stageIndex = getStageIndex(stage);
    const effectiveIndex = getStageIndex(effectiveStatus);
    const reached = stageIndex !== -1 && effectiveIndex !== -1 && stageIndex <= effectiveIndex;
    const current = isTerminal ? false : isCurrentStage(stage, effectiveStatus);

    return {
      status: stage,
      label: stage,
      reached,
      current,
      date: findStageDate(stage, idea.statusChanges, idea.createdAt),
    };
  });
}
