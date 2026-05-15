/**Pipeline data computation — pure functions transforming idea data into PipelineStage[].
 *
 * This module is the data transformation layer between raw idea data
 * and the IdeaPipeline component. All functions are pure with no
 * side effects, making them independently testable.
 */
import type { Status } from "@prisma/client";
import { PIPELINE_STAGES, getStageIndex, isCurrentStage } from "./pipeline-stages";
import type { PipelineStage } from "@/components/ideas/pipeline-track";
import type { StatusChange } from "./types";

export type IdeaData = {
  status: Status;
  createdAt: string;
  statusChanges: StatusChange[];
};

/** Find the most recent date a status change arrived at the given stage. */
function findStageDate(
  stage: Status,
  statusChanges: StatusChange[],
  ideaCreatedAt: string
): string | null {
  if (stage === "SUBMITTED") {
    return ideaCreatedAt;
  }
  const matching = statusChanges.filter(
    (sc) => sc.toStatus != null && sc.toStatus === stage
  );
  if (matching.length === 0) {
    return null;
  }
  const mostRecent = matching[matching.length - 1];
  return mostRecent.createdAt ?? null;
}

/** For REJECTED ideas, find the highest forward pipeline stage reached before rejection.
 * This allows the pipeline to show progress up to the point of rejection. */
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

/** Determine the exception state from the idea status only (no note inspection).
 * Returns undefined for forward-pipeline statuses.
 * For MERGED/RETURNED detection, use resolveExceptionType instead. */
export function getExceptionState(
  status: Status
): "REJECTED" | "MERGED" | "RETURNED" | "STALLED" | undefined {
  if (status === "REJECTED") return "REJECTED";
  return undefined;
}

/** Find the most recent StatusChange where toStatus === "REJECTED". */
export function findRejectionChange(
  statusChanges: StatusChange[]
): StatusChange | null {
  const rejectionChanges = statusChanges.filter(
    (sc) => sc.toStatus === "REJECTED"
  );
  if (rejectionChanges.length === 0) return null;
  return rejectionChanges[rejectionChanges.length - 1];
}

/** Resolve the exception type from status + most recent rejection note prefix.
 * Per DDD-5/ADR-002:
 *   - "[MERGED]" prefix -> "MERGED"
 *   - "[RETURNED]" prefix -> "RETURNED"
 *   - Otherwise -> "REJECTED" (default)
 *   - Non-REJECTED status -> undefined
 *   - REJECTED but no rejection change found -> undefined
 */
export function resolveExceptionType(
  status: Status,
  statusChanges: StatusChange[]
): "REJECTED" | "MERGED" | "RETURNED" | undefined {
  if (status !== "REJECTED") return undefined;
  const rejectionChange = findRejectionChange(statusChanges);
  if (!rejectionChange) return undefined;

  const note = rejectionChange.note ?? "";
  if (note.match(/^\[MERGED\]/i)) return "MERGED";
  if (note.match(/^\[RETURNED\]/i)) return "RETURNED";
  return "REJECTED";
}

/** Parse a MERGED note to extract parent idea ID and optional title.
 * Patterns recognized:
 *   "[MERGED] merged with idea #cm5x8k2q"   -> { parentIdeaId: "cm5x8k2q", parentIdeaTitle: null }
 *   "[MERGED] idea cm5x8k2q"                 -> { parentIdeaId: "cm5x8k2q", parentIdeaTitle: null }
 *   "[MERGED] #abc123 - Better sidewalks"   -> { parentIdeaId: "abc123", parentIdeaTitle: "Better sidewalks" }
 *   "[MERGED]"                               -> { parentIdeaId: null, parentIdeaTitle: null }
 */
export function parseMergeNote(note: string): {
  parentIdeaId: string | null;
  parentIdeaTitle: string | null;
} {
  const content = note.replace(/^\[MERGED\]\s*/i, "").trim();
  if (!content) return { parentIdeaId: null, parentIdeaTitle: null };

  // Try to match #<id> first (explicit ID marker)
  const hashMatch = content.match(/#([a-zA-Z0-9]+)/);
  let rawId: string | null = null;
  let idEndIndex: number | null = null;

  if (hashMatch) {
    rawId = hashMatch[1];
    idEndIndex = (hashMatch.index ?? 0) + hashMatch[0].length;
  } else {
    // Try standalone alphanumeric id (at least 6 chars, not a common word)
    // Match after prepositions like "with", "into", "to"
    const bareMatch = content.match(/\b(?:with|into|to)\s+([a-zA-Z0-9]{6,})/);
    if (bareMatch) {
      rawId = bareMatch[1];
      idEndIndex = (bareMatch.index ?? 0) + bareMatch[0].length;
    } else {
      // Last resort: match trailing alphanumeric token
      const trailingMatch = content.match(/\b([a-zA-Z0-9]{6,})\s*$/);
      if (trailingMatch) {
        rawId = trailingMatch[1];
        idEndIndex = (trailingMatch.index ?? 0) + trailingMatch[0].length;
      }
    }
  }

  if (!rawId) return { parentIdeaId: null, parentIdeaTitle: null };

  // Extract title: everything after the ID, looking for separator patterns
  let parentIdeaTitle: string | null = null;
  if (idEndIndex !== null) {
    const afterId = content.slice(idEndIndex).trim();
    // Common patterns: " - Title", " – Title", " — Title"
    const titleMatch = afterId.match(/^[-–—]\s*(.+)/);
    if (titleMatch) {
      parentIdeaTitle = titleMatch[1].trim() || null;
    }
  }

  return { parentIdeaId: rawId, parentIdeaTitle };
}

/** Extract admin feedback text from a RETURNED note.
 * Strips the "[RETURNED]" prefix and trims whitespace.
 * Returns empty string if no content after prefix.
 */
export function parseReturnNote(note: string): string {
  return note.replace(/^\[RETURNED\]\s*/i, "").trim();
}

/** Resolve the effective current status for pipeline stage computation.
 * For REJECTED ideas, uses the last forward pipeline stage reached. */
function resolveEffectiveStatus(idea: IdeaData): Status {
  if (idea.status !== "REJECTED") {
    return idea.status;
  }
  const lastForward = findLastForwardStage(idea.statusChanges);
  return lastForward ?? "SUBMITTED";
}

/** Transform idea data into a PipelineStage[] array for IdeaPipeline rendering.
 *
 * Maps each of the 7 forward PIPELINE_STAGES to a PipelineStage with:
 * - reached: whether the idea has reached or passed this stage
 * - current: whether this is the idea's current status
 * - date: the date the stage was reached (from statusChanges or createdAt)
 * - label: the status key (used by the component to look up translations)
 *
 * For REJECTED ideas, no stage is marked as "current" since the idea
 * is no longer in the forward pipeline. Stages reached before rejection
 * are still marked as "reached".
 */
export function computePipelineStages(idea: IdeaData): PipelineStage[] {
  const effectiveStatus = resolveEffectiveStatus(idea);
  const isRejected = idea.status === "REJECTED";

  return PIPELINE_STAGES.map((stage) => {
    const stageIndex = getStageIndex(stage);
    const effectiveIndex = getStageIndex(effectiveStatus);
    const reached = stageIndex !== -1 && effectiveIndex !== -1 && stageIndex <= effectiveIndex;
    const current = isRejected ? false : isCurrentStage(stage, effectiveStatus);

    return {
      status: stage,
      label: stage,
      reached,
      current,
      date: findStageDate(stage, idea.statusChanges, idea.createdAt),
    };
  });
}
