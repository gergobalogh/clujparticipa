"use client";

import type { JSX } from "react";
import type { Status } from "@prisma/client";
import { useTranslations } from "next-intl";
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
  exceptionState?: "REJECTED" | "NEEDS_REVISION" | "MERGED" | "WITHDRAWN" | "STALLED";
  stalledLabel?: string;
  stalledDays?: number;
  isMobile?: boolean;
  showcase?: boolean;
  onStageClick?: (status: Status) => void;
};

export function PipelineTrack({
  stages,
  exceptionState,
  stalledLabel,
  stalledDays,
  isMobile = false,
  showcase = false,
  onStageClick,
}: PipelineTrackProps): JSX.Element {
  const t = useTranslations("Statuses");
  const rej = showcase ? false : exceptionState === "REJECTED";

  function dotClass(stage: PipelineStage): string {
    if (rej) return "h-3 w-3 border-2 border-red-600 bg-red-600";
    if (stage.current) return "h-4 w-4 border-[3px] border-ink bg-paper";
    if (!stage.reached) return "h-3 w-3 border-2 border-gray-300 bg-paper";
    return "h-3 w-3 bg-ink";
  }

  function segmentColor(reached: boolean): string {
    return reached ? (rej ? "bg-red-600" : "bg-ink") : "bg-gray-200";
  }

  function labelTextClass(stage: PipelineStage): string {
    if (stage.current) return "font-semibold text-ink";
    if (!stage.reached) return "text-gray-400";
    return "text-gray-500";
  }

  if (isMobile) {
    return (
      <div>
        <div
          data-testid="pipeline-track"
          className="relative ml-2 min-h-72 w-full py-2 pl-6"
        >
          <div className="flex flex-col">
            {stages.map((stage, i) => {
              const isLast = i === stages.length - 1;
              const nextReached = !isLast && stages[i + 1].reached;

              const markerContent = (
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span
                      data-testid="stage-marker"
                      className={`relative z-10 inline-flex rounded-full ${dotClass(stage)}`}
                    />
                    {!isLast && (
                      <div
                        data-testid="track-segment"
                        className={`w-0.5 flex-1 min-h-[28px] mt-0.5 ${segmentColor(nextReached)}`}
                      />
                    )}
                  </div>
                  <div data-testid="stage-label" className="pb-5 -mt-0.5">
                    <span className={`block text-sm ${labelTextClass(stage)}`}>
                      {t(stage.status)}
                    </span>
                    {stage.current && stage.date && (
                      <span className="block text-xs text-ink-muted">{stage.date}</span>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={stage.status}>
                  {showcase ? (
                    <a
                      data-testid="stage-anchor"
                      href={`#${stage.status.toLowerCase()}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onStageClick?.(stage.status);
                      }}
                    >
                      {markerContent}
                    </a>
                  ) : (
                    markerContent
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {exceptionState === "STALLED" && stalledLabel && (
          <StalledIndicator label={stalledLabel} daysAgo={stalledDays ?? 0} fullWidth />
        )}
      </div>
    );
  }

  // Horizontal stepper: labels sit below each dot, in-flow (no absolute positioning)
  return (
    <div>
      <div data-testid="pipeline-track" className="w-full py-3">
        <div className="flex items-start">
          {stages.map((stage, i) => {
            const isFirst = i === 0;
            const isLast = i === stages.length - 1;

            const markerContent = (
              <div className="flex flex-col items-center">
                {/* Dot row with half-bar connectors */}
                <div className="relative flex w-full items-center justify-center h-4">
                  {!isFirst && (
                    <div
                      data-testid="track-segment"
                      className={`absolute top-1/2 -translate-y-1/2 right-[50%] left-0 h-0.5 ${segmentColor(stage.reached)}`}
                    />
                  )}
                  {!isLast && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 left-[50%] right-0 h-0.5 ${segmentColor(stages[i + 1].reached)}`}
                    />
                  )}
                  <span
                    data-testid="stage-marker"
                    className={`relative z-10 inline-flex flex-shrink-0 rounded-full ${dotClass(stage)}`}
                  />
                </div>
                {/* Label below */}
                <div data-testid="stage-label" className="mt-1.5 text-center w-full px-0.5">
                  <span className={`block text-xs leading-tight ${labelTextClass(stage)}`}>
                    {t(stage.status)}
                  </span>
                  {stage.current && stage.date && (
                    <span className="block text-xs text-ink-muted">{stage.date}</span>
                  )}
                </div>
              </div>
            );

            return (
              <div key={stage.status} className="flex-1 relative">
                {showcase ? (
                  <a
                    data-testid="stage-anchor"
                    href={`#${stage.status.toLowerCase()}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onStageClick?.(stage.status);
                    }}
                  >
                    {markerContent}
                  </a>
                ) : (
                  markerContent
                )}
              </div>
            );
          })}
        </div>
      </div>

      {exceptionState === "STALLED" && stalledLabel && (
        <StalledIndicator label={stalledLabel} daysAgo={stalledDays ?? 0} fullWidth />
      )}
    </div>
  );
}
