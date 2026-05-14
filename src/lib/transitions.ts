import type { Status } from "@prisma/client";

/**
 * Valid forward transitions per the status workflow design.
 * Skip-around transitions require `force: true`.
 */
export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ELIGIBLE", "REJECTED"],
  ELIGIBLE: ["IN_VOTING", "REJECTED"],
  IN_VOTING: ["SELECTED", "REJECTED"],
  SELECTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: ["UNDER_REVIEW"],
};

export const ALL_STATUSES: Status[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ELIGIBLE",
  "IN_VOTING",
  "SELECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
];

export function isValidTransition(from: Status, to: Status): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: Status): Status[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/** Statuses where voting/support is allowed */
export const VOTE_ELIGIBLE_STATUSES: Status[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ELIGIBLE",
  "IN_VOTING",
];

/** Statuses where the action label should be "Back this idea" rather than "Vote" */
export const SUPPORT_LABEL_STATUSES: Status[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ELIGIBLE",
];

export type QuickAction = {
  to: Status;
  labelKey: string; // translation key in Admin.quickActions namespace
  variant: "primary" | "danger";
};

export const QUICK_ACTIONS: Record<Status, QuickAction[]> = {
  SUBMITTED: [
    { to: "UNDER_REVIEW", labelKey: "startReview", variant: "primary" },
    { to: "REJECTED", labelKey: "reject", variant: "danger" },
  ],
  UNDER_REVIEW: [
    { to: "ELIGIBLE", labelKey: "markEligible", variant: "primary" },
    { to: "REJECTED", labelKey: "reject", variant: "danger" },
  ],
  ELIGIBLE: [
    { to: "IN_VOTING", labelKey: "sendToVoting", variant: "primary" },
  ],
  IN_VOTING: [
    { to: "SELECTED", labelKey: "selectIdea", variant: "primary" },
    { to: "REJECTED", labelKey: "reject", variant: "danger" },
  ],
  SELECTED: [
    { to: "IN_PROGRESS", labelKey: "startImplementation", variant: "primary" },
  ],
  IN_PROGRESS: [
    { to: "COMPLETED", labelKey: "markCompleted", variant: "primary" },
  ],
  COMPLETED: [],
  REJECTED: [
    { to: "UNDER_REVIEW", labelKey: "reopen", variant: "primary" },
  ],
};
