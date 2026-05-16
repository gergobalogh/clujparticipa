import { type BadgeVariant } from "@/components/ui/badge";
import type { Status } from "@prisma/client";

/** Map legacy statuses to their modern equivalents for Phase 1 compatibility.
 * UNDER_REVIEW and ELIGIBLE ideas in the DB are treated as IN_VOTING. */
export function normalizeStatus(status: Status): Status {
  if (status === "UNDER_REVIEW" || status === "ELIGIBLE") return "IN_VOTING";
  return status;
}

const statusToBadge: Record<string, BadgeVariant> = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review", // legacy — maps to in_voting visually
  ELIGIBLE: "eligible", // legacy — maps to in_voting visually
  IN_VOTING: "in_voting",
  SELECTED: "selected",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
  NEEDS_REVISION: "needs_revision",
  MERGED: "merged",
  WITHDRAWN: "withdrawn",
};

export function statusToBadgeVariant(status: string): BadgeVariant {
  const normalized = normalizeStatus(status as Status);
  return statusToBadge[normalized] ?? statusToBadge[status] ?? "default";
}
