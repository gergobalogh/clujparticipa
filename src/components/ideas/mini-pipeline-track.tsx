"use client";

/** Compact 3-milestone continuous track for idea cards. */
import type { JSX } from "react";
import type { Status } from "@prisma/client";
import { useTranslations } from "next-intl";
import { getStageIndex } from "@/lib/pipeline-stages";

export type MiniPipelineTrackProps = {
  currentStatus: Status;
};

// ---------------------------------------------------------------------------
// Pure domain: milestone grouping per DDD-6/ADR-003
// ---------------------------------------------------------------------------

type MilestoneKey = "submitted" | "inVoting" | "completed";

interface Milestone {
  key: MilestoneKey;
  labelKey: string;
  /** Minimum stage index required for this milestone to be reached. */
  minStageIndex: number;
  /** Stage index range (inclusive) where this milestone is "current". */
  currentFrom: number;
  currentTo: number;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    key: "submitted",
    labelKey: "submitted",
    minStageIndex: 0, // SUBMITTED
    currentFrom: 0,   // SUBMITTED
    currentTo: 0,     // SUBMITTED
    color: "bg-amber-600",
  },
  {
    key: "inVoting",
    labelKey: "inVoting",
    minStageIndex: 1, // IN_VOTING
    currentFrom: 1,   // IN_VOTING
    currentTo: 3,     // ACCEPTED
    color: "bg-purple-700",
  },
  {
    key: "completed",
    labelKey: "completed",
    minStageIndex: 4, // IN_PROGRESS
    currentFrom: 4,   // IN_PROGRESS
    currentTo: 5,     // COMPLETED
    color: "bg-teal-600",
  },
];

function isMilestoneReached(milestone: Milestone, stageIndex: number): boolean {
  if (stageIndex < 0) return false;
  return stageIndex >= milestone.minStageIndex;
}

function isMilestoneCurrent(milestone: Milestone, stageIndex: number): boolean {
  if (stageIndex < 0) return false;
  return stageIndex >= milestone.currentFrom && stageIndex <= milestone.currentTo;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MiniPipelineTrack({ currentStatus }: MiniPipelineTrackProps): JSX.Element | null {
  const t = useTranslations("MiniPipeline");
  const stageIndex = getStageIndex(currentStatus);

  // Terminal-status ideas (REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN) and legacy statuses show no mini-pipeline
  if (stageIndex === -1) return null;

  return (
    <div className="relative flex flex-col" data-testid="mini-pipeline-track">
      {/* Base bar + colored segments */}
      <div className="relative h-1 w-full rounded-full bg-gray-200" data-testid="mini-track-base">
        {/* Colored overlay segments for reached milestones */}
        {MILESTONES.map((milestone, index) => {
          const reached = isMilestoneReached(milestone, stageIndex);
          if (!reached) return null;
          // Each reached segment spans from its milestone position to the next
          const segmentWidth = index === MILESTONES.length - 1
            ? `${100 / MILESTONES.length}%`
            : `${100 / MILESTONES.length}%`;
          const leftOffset = `${(index * 100) / MILESTONES.length}%`;
          return (
            <span
              key={milestone.key}
              className={`absolute top-0 h-1 rounded-full ${milestone.color}`}
              style={{ left: leftOffset, width: segmentWidth }}
              data-testid={`track-segment-${milestone.key}`}
            />
          );
        })}
      </div>

      {/* Milestone markers positioned on the bar */}
      <div className="relative flex justify-between" style={{ marginTop: "-5px" }}>
        {MILESTONES.map((milestone) => {
          const reached = isMilestoneReached(milestone, stageIndex);
          const current = isMilestoneCurrent(milestone, stageIndex);

          return (
            <span
              key={milestone.key}
              data-testid={`milestone-${milestone.key}`}
              data-reached={reached ? "true" : "false"}
              data-current={current ? "true" : "false"}
              className="flex flex-col items-center"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  reached
                    ? `${milestone.color} ${current ? "ring-2 ring-offset-1 ring-amber-400" : ""}`
                    : "bg-gray-200 outline outline-1 outline-gray-300"
                }`}
                {...(reached ? { "data-reached-dot": "" } : { "data-future-dot": "" })}
              />
              <span
                className={`mt-0.5 text-[10px] leading-tight ${
                  reached ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {t(milestone.labelKey)}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
