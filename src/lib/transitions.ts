import type { Status } from "@prisma/client";

/**
 * Valid forward transitions per the 10-status pipeline design.
 * Terminal statuses (REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN) have no outgoing transitions.
 * UNDER_REVIEW and ELIGIBLE are legacy values (Phase 1 compatibility) with no incoming transitions.
 */
export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  SUBMITTED: ["IN_VOTING", "WITHDRAWN", "MERGED"],
  UNDER_REVIEW: [], // legacy — no transitions in or out
  ELIGIBLE: [], // legacy — no transitions in or out
  IN_VOTING: ["SELECTED", "WITHDRAWN", "MERGED"],
  SELECTED: ["ACCEPTED", "REJECTED", "NEEDS_REVISION", "MERGED"],
  ACCEPTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  NEEDS_REVISION: [],
  MERGED: [],
  WITHDRAWN: [],
};

export const ALL_STATUSES: Status[] = [
  "SUBMITTED",
  "IN_VOTING",
  "SELECTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
  "NEEDS_REVISION",
  "MERGED",
  "WITHDRAWN",
];

/** Legacy statuses that may exist in the database during Phase 1 but should not be produced. */
export const LEGACY_STATUSES: Status[] = ["UNDER_REVIEW", "ELIGIBLE"];

export function isValidTransition(from: Status, to: Status): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: Status): Status[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/** Statuses where voting/support is allowed */
export const VOTE_ELIGIBLE_STATUSES: Status[] = [
  "SUBMITTED",
  "IN_VOTING",
];

/** Statuses where the action label should be "Back this idea" rather than "Vote" */
export const SUPPORT_LABEL_STATUSES: Status[] = [
  "SUBMITTED",
];

/** Terminal statuses — no outgoing transitions, not on the forward pipeline */
export const TERMINAL_STATUSES: Status[] = [
  "REJECTED",
  "NEEDS_REVISION",
  "MERGED",
  "WITHDRAWN",
];

export type QuickAction = {
  to: Status;
  labelKey: string;
  variant: "primary" | "danger";
};

export const QUICK_ACTIONS: Record<Status, QuickAction[]> = {
  SUBMITTED: [
    { to: "IN_VOTING", labelKey: "sendToVoting", variant: "primary" },
    { to: "MERGED", labelKey: "merge", variant: "primary" },
    { to: "WITHDRAWN", labelKey: "withdraw", variant: "danger" },
  ],
  UNDER_REVIEW: [], // legacy
  ELIGIBLE: [], // legacy
  IN_VOTING: [
    { to: "SELECTED", labelKey: "selectIdea", variant: "primary" },
    { to: "MERGED", labelKey: "merge", variant: "primary" },
  ],
  SELECTED: [
    { to: "ACCEPTED", labelKey: "accept", variant: "primary" },
    { to: "REJECTED", labelKey: "reject", variant: "danger" },
    { to: "NEEDS_REVISION", labelKey: "needsRevision", variant: "primary" },
    { to: "MERGED", labelKey: "merge", variant: "primary" },
  ],
  ACCEPTED: [
    { to: "IN_PROGRESS", labelKey: "startImplementation", variant: "primary" },
  ],
  IN_PROGRESS: [
    { to: "COMPLETED", labelKey: "markCompleted", variant: "primary" },
  ],
  COMPLETED: [],
  REJECTED: [],
  NEEDS_REVISION: [],
  MERGED: [],
  WITHDRAWN: [],
};
