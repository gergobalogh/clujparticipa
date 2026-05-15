"use client";

/** Compact 3-stage pipeline indicator for idea cards. */
import React from "react";
import type { Status } from "@prisma/client";
import { useTranslations } from "next-intl";
import { getStageIndex } from "@/lib/pipeline-stages";

export type MiniPipelineProps = {
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
    currentTo: 2,     // ELIGIBLE
    color: "bg-amber-600",
  },
  {
    key: "inVoting",
    labelKey: "inVoting",
    minStageIndex: 3, // IN_VOTING
    currentFrom: 3,   // IN_VOTING
    currentTo: 4,     // SELECTED
    color: "bg-purple-700",
  },
  {
    key: "completed",
    labelKey: "completed",
    minStageIndex: 5, // IN_PROGRESS
    currentFrom: 5,   // IN_PROGRESS
    currentTo: 6,     // COMPLETED
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

export function MiniPipeline({ currentStatus }: MiniPipelineProps): React.JSX.Element {
  const t = useTranslations("MiniPipeline");
  const stageIndex = getStageIndex(currentStatus);

  // REJECTED ideas show no mini-pipeline
  if (stageIndex === -1) return <></>;

  return (
    <div className="flex items-center gap-0" data-testid="mini-pipeline">
      {MILESTONES.map((milestone, index) => {
        const reached = isMilestoneReached(milestone, stageIndex);
        const current = isMilestoneCurrent(milestone, stageIndex);

        return (
          <span key={milestone.key} className="contents">
            {/* Connector line before milestone (skip first) */}
            {index > 0 && (
              <span
                data-testid="milestone-connector"
                className={`h-0.5 w-4 ${
                  reached ? "bg-gray-400" : "bg-gray-200"
                }`}
              />
            )}
            {/* Milestone dot + label */}
            <span
              data-testid={`milestone-${milestone.key}`}
              data-reached={reached ? "true" : "false"}
              data-current={current ? "true" : "false"}
              className="flex flex-col items-center"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  reached
                    ? milestone.color
                    : "bg-gray-200 outline outline-1 outline-gray-300"
                } ${current ? "ring-2 ring-offset-1 ring-amber-400" : ""}`}
              />
              <span
                className={`mt-0.5 text-[10px] leading-tight ${
                  reached ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {t(milestone.labelKey)}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
