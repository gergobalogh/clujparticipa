import { type BadgeVariant } from "@/components/ui/badge";

const statusToBadge: Record<string, BadgeVariant> = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  ELIGIBLE: "eligible",
  IN_VOTING: "in_voting",
  SELECTED: "selected",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

export function statusToBadgeVariant(status: string): BadgeVariant {
  return statusToBadge[status] ?? "default";
}
