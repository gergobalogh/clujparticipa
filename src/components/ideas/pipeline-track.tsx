"use client";

import type { JSX } from "react";
import type { Status } from "@prisma/client";
import { motion } from "motion/react";
import { PipelineTrackSegment } from "./pipeline-track-segment";
import { StalledIndicator } from "./stalled-indicator";

export type PipelineStage = {
  status: Status;
  label: string;
  reached: boolean;
  current: boolean;
  date: string | null;
};

export type PipelineTrackProps = {
  stages: PipelineStage[];
  exceptionState?: "REJECTED" | "MERGED" | "RETURNED" | "STALLED";
  stalledLabel?: string;
  stalledDays?: number;
  isMobile?: boolean;
};

export function PipelineTrack({
  stages,
  exceptionState,
  stalledLabel,
  stalledDays,
  isMobile = false,
}: PipelineTrackProps): JSX.Element {
  const isVertical = isMobile;

  return (
    <div>
      <div
        data-testid="pipeline-track"
        className={`relative flex ${isVertical ? "flex-col items-start" : "sm:flex-row flex-row items-center"}`}
      >
        {/* Gray base bar */}
        <div
          data-testid="track-base"
          className={`rounded-full bg-gray-200 ${
            isVertical ? "w-2 h-full min-h-64" : "h-2 w-full"
          }`}
        />

        {/* Colored overlay with entrance animation */}
        <motion.div
          data-testid="track-overlay"
          className={`absolute rounded-full ${
            isVertical
              ? "left-0 top-0 w-2 h-full"
              : "left-0 top-1/2 -translate-y-1/2 h-2 w-full"
          }`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6 }}
          style={{ transformOrigin: isVertical ? "top" : "left" }}
        >
          <div className="flex h-full w-full">
            {stages.map((stage, index) => {
              const segmentWidth = `${100 / stages.length}%`;
              return (
                <div
                  key={stage.status}
                  data-testid="track-segment"
                  className={`h-full ${
                    stage.reached || stage.current
                      ? getSegmentColor(stage.status, exceptionState)
                      : "bg-gray-200"
                  }`}
                  style={{ width: segmentWidth }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Stage markers and labels positioned on the bar */}
        {stages.map((stage, index) => {
          const positionPercent = stages.length > 1
            ? (index / (stages.length - 1)) * 100
            : 50;

          return (
            <div
              key={`marker-${stage.status}`}
              className={`absolute flex flex-col items-center ${
                isVertical
                  ? "flex-row"
                  : ""
              }`}
              style={
                isVertical
                  ? { top: `${positionPercent}%`, left: "0" }
                  : { left: `${positionPercent}%`, top: "50%", transform: "translate(-50%, -50%)" }
              }
            >
              <PipelineTrackSegment
                stage={stage}
                exceptionState={exceptionState}
                index={index}
                isVertical={isVertical}
                labelPosition={
                  isVertical
                    ? "after"
                    : index % 2 === 0
                      ? "before"
                      : "after"
                }
              />
            </div>
          );
        })}
      </div>

      {/* Stalled indicator below the track */}
      {exceptionState === "STALLED" && stalledLabel && (
        <StalledIndicator
          label={stalledLabel}
          daysAgo={stalledDays ?? 0}
          fullWidth
        />
      )}
    </div>
  );
}

function getSegmentColor(
  status: PipelineStage["status"],
  exceptionState?: string
): string {
  if (exceptionState === "REJECTED") return "bg-red-600";
  const colors: Record<string, string> = {
    SUBMITTED: "bg-civic-orange",
    UNDER_REVIEW: "bg-civic-orange",
    ELIGIBLE: "bg-civic-blue",
    IN_VOTING: "bg-purple-700",
    SELECTED: "bg-civic-teal",
    IN_PROGRESS: "bg-civic-teal",
    COMPLETED: "bg-civic-teal",
  };
  return colors[status] ?? "bg-gray-400";
}
