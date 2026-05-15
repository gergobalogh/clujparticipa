"use client";

import type { JSX } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import type { PipelineStage } from "./pipeline-track";

export type PipelineTrackSegmentProps = {
  stage: PipelineStage;
  exceptionState?: "REJECTED" | "MERGED" | "RETURNED" | "STALLED";
  index: number;
  isVertical?: boolean;
  labelPosition?: "before" | "after";
};

const STAGE_MARKER_COLORS: Record<string, string> = {
  SUBMITTED: "bg-civic-orange",
  UNDER_REVIEW: "bg-civic-orange",
  ELIGIBLE: "bg-civic-blue",
  IN_VOTING: "bg-purple-700",
  SELECTED: "bg-civic-teal",
  IN_PROGRESS: "bg-civic-teal",
  COMPLETED: "bg-civic-teal",
};

function markerColor(status: PipelineStage["status"]): string {
  return STAGE_MARKER_COLORS[status] ?? "bg-gray-400";
}

export function PipelineTrackSegment({
  stage,
  exceptionState,
  index,
  isVertical = false,
  labelPosition = "after",
}: PipelineTrackSegmentProps): JSX.Element {
  const t = useTranslations("Statuses");
  const isRejected = exceptionState === "REJECTED";
  const isFuture = !stage.reached && !stage.current;
  const isCurrent = stage.current && !isRejected;

  const trackColor = isFuture ? "bg-gray-200" : markerColor(stage.status);

  return (
    <div className="relative flex flex-col items-center" data-testid="pipeline-track-segment">
      <div
        data-testid="track-segment"
        className={`h-2 w-full ${trackColor} ${isRejected && !isFuture ? "" : ""}`}
      />

      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        data-testid="motion-marker"
      >
        {isCurrent && (
          <span
            data-testid="pulse-ring"
            className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-purple-700 opacity-75"
          />
        )}
        <span
          data-testid="stage-marker"
          className={`relative inline-flex h-4 w-4 rounded-full ${
            isRejected
              ? "bg-red-600"
              : isFuture
                ? "border-2 border-gray-300 bg-transparent"
                : markerColor(stage.status)
          }`}
        />
      </motion.div>

      <span
        data-testid="stage-label"
        className={`text-sm ${
          labelPosition === "before" ? "order-before" : "order-after"
        } ${
          isVertical ? "ml-2" : labelPosition === "before" ? "mb-2" : "mt-2"
        } ${
          isCurrent
            ? "font-semibold text-ink"
            : isRejected
              ? "font-semibold text-red-600"
              : isFuture
                ? "text-ink-muted"
                : "text-ink-muted"
        }`}
      >
        {t(stage.status)}
      </span>

      {stage.reached && !stage.current && stage.date && (
        <span className="text-xs text-ink-muted">{stage.date}</span>
      )}
    </div>
  );
}
