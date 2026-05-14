/**Stalled idea detection logic — pure function, no side effects. */
import type { Status } from "@prisma/client";

export type StalledInfo = {
  isStalled: boolean;
  daysSinceLastChange: number;
  waitingForLabel: string;
};

const STALLED_WAITING_LABELS: Record<Status, string> = {
  SUBMITTED: "",
  UNDER_REVIEW: "City department review",
  ELIGIBLE: "Eligibility assessment",
  IN_VOTING: "Public voting period",
  SELECTED: "Selection for implementation",
  IN_PROGRESS: "Implementation in progress",
  COMPLETED: "",
  REJECTED: "",
};

const STALLED_THRESHOLD_DAYS = 30;

/** Statuses that can never show a stalled indicator, regardless of time elapsed. */
const NEVER_STALLED_STATUSES: Set<Status> = new Set<Status>([
  "SUBMITTED",
  "COMPLETED",
  "REJECTED",
]);

function calculateDaysSince(lastChangeDate: Date, now: Date): number {
  const msPerDay = 86_400_000;
  const diffMs = now.getTime() - lastChangeDate.getTime();
  return Math.floor(diffMs / msPerDay);
}

function isNeverStalled(status: Status): boolean {
  return NEVER_STALLED_STATUSES.has(status);
}

export function detectStalledIdea(
  currentStatus: Status,
  lastStatusChangeDate: Date,
  now: Date = new Date()
): StalledInfo {
  const daysSinceLastChange = calculateDaysSince(lastStatusChangeDate, now);
  const waitingForLabel = STALLED_WAITING_LABELS[currentStatus] ?? "";

  if (isNeverStalled(currentStatus)) {
    return { isStalled: false, daysSinceLastChange, waitingForLabel };
  }

  const isStalled = daysSinceLastChange >= STALLED_THRESHOLD_DAYS;

  return { isStalled, daysSinceLastChange, waitingForLabel };
}
