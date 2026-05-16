/** Pipeline stage ordering logic — pure functions derived from transitions.ts. */
import type { Status } from "@prisma/client";
import { ALL_STATUSES, TERMINAL_STATUSES, LEGACY_STATUSES } from "./transitions";

/** Forward pipeline stages — the active path from submission to completion. */
export const PIPELINE_STAGES: Status[] = ALL_STATUSES.filter(
  (s) => !TERMINAL_STATUSES.includes(s) && !LEGACY_STATUSES.includes(s)
);

/** Index of a status within the forward pipeline. Returns -1 for terminal or legacy values. */
export function getStageIndex(status: Status): number {
  return PIPELINE_STAGES.indexOf(status);
}

/** True when the given stage has been reached or passed by the current status. */
export function isStageReached(stage: Status, currentStatus: Status): boolean {
  const stageIndex = getStageIndex(stage);
  const currentIndex = getStageIndex(currentStatus);
  if (stageIndex === -1 || currentIndex === -1) return false;
  return stageIndex <= currentIndex;
}

/** True only when the stage exactly matches the current status. */
export function isCurrentStage(stage: Status, currentStatus: Status): boolean {
  if (getStageIndex(stage) === -1 || getStageIndex(currentStatus) === -1) {
    return false;
  }
  return stage === currentStatus;
}
