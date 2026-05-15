"use client";

import type { JSX } from "react";
import { useTranslations } from "next-intl";
import type { PipelineStage } from "./idea-pipeline";

export type IdeaPipelineStageProps = {
  stage: PipelineStage;
  exceptionState?: "REJECTED" | "MERGED" | "RETURNED" | "STALLED";
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

export function IdeaPipelineStage({
  stage,
  exceptionState,
}: IdeaPipelineStageProps): JSX.Element {
  const t = useTranslations("Statuses");

  const isRejected = exceptionState === "REJECTED";

  if (!stage.reached && !stage.current) {
    return (
      <div className="flex items-center gap-3" data-testid="pipeline-stage">
        <span
          data-testid="stage-marker"
          className="inline-block h-3 w-3 rounded-full border-2 border-gray-300"
        />
        <span className="text-sm text-ink-muted">
          {t(stage.status)}
        </span>
      </div>
    );
  }

  if (stage.current && !isRejected) {
    return (
      <div className="flex items-center gap-3" data-testid="pipeline-stage">
        <span className="relative inline-flex">
          <span
            data-testid="pulse-ring"
            className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-purple-700 opacity-75"
          />
          <span
            data-testid="stage-marker"
            className={`relative inline-flex h-3 w-3 rounded-full ${markerColor(stage.status)}`}
          />
        </span>
        <span className="text-sm font-semibold text-ink">
          {t(stage.status)}
        </span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex items-center gap-3" data-testid="pipeline-stage">
        <span
          data-testid="stage-marker"
          className="inline-block h-3 w-3 rounded-full bg-red-600"
        />
        <span className="text-sm font-semibold text-red-600">
          {t(stage.status)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3" data-testid="pipeline-stage">
      <span
        data-testid="stage-marker"
        className={`inline-block h-3 w-3 rounded-full ${markerColor(stage.status)}`}
      />
      <span className="text-sm text-ink-muted">
        {t(stage.status)}
      </span>
      {stage.date && (
        <span className="text-xs text-ink-muted">{stage.date}</span>
      )}
    </div>
  );
}
