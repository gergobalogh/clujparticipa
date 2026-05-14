/**Pipeline data computation — pure functions transforming idea data into PipelineStage[].
 *
 * This module is the data transformation layer between raw idea data
 * and the IdeaPipeline component. All functions are pure with no
 * side effects, making them independently testable.
 */
import type { Status } from "@prisma/client";
import { PIPELINE_STAGES, getStageIndex, isStageReached, isCurrentStage } from "./pipeline-stages";
import type { PipelineStage } from "@/components/ideas/idea-pipeline";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};

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

/** Determine the exception state from the idea status.
 * Returns undefined for forward-pipeline statuses. */
export function getExceptionState(
  status: Status
): "REJECTED" | "MERGED" | "RETURNED" | "STALLED" | undefined {
  if (status === "REJECTED") return "REJECTED";
  return undefined;
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
