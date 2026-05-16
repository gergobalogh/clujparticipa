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
  const v = isMobile;
  const effectiveStages = showcase
    ? stages.map((s) => ({ ...s, reached: true, current: false }))
    : stages;
  const rej = showcase ? false : exceptionState === "REJECTED";
  const rc = effectiveStages.filter((s) => s.reached || s.current).length;
  const intervals = effectiveStages.length > 1 ? effectiveStages.slice(0, -1) : effectiveStages;

  return (
    <div>
      <div
        data-testid="pipeline-track"
        className={`relative ${v ? "ml-2 min-h-72 w-full py-2 pl-6" : "h-28 w-full px-4"}`}
      >
        {/* Shared positioning context for bar + markers */}
        <div className={`relative ${v ? "h-full w-2" : "h-2 w-full"} ${v ? "ml-3" : "mt-[52px]"}`}>
          {/* Gray base bar */}
          <div
            data-testid="track-base"
            className="absolute inset-0 rounded-full bg-gray-200"
          />

          {/* Colored overlay */}
          <div
            data-testid="track-overlay"
            className="absolute inset-0 overflow-hidden rounded-full"
          >
            <div className={`flex h-full w-full ${v ? "flex-col" : ""}`}>
              {intervals.map((stage, i) => (
                <div
                  key={stage.status}
                  data-testid="track-segment"
                  className={`${v ? "w-full" : "h-full"} ${i < rc - 1 ? (rej ? "bg-red-600" : "bg-ink") : "bg-gray-200"}`}
                  style={v ? { height: `${100 / intervals.length}%` } : { width: `${100 / intervals.length}%` }}
                />
              ))}
            </div>
          </div>

          {/* Stage markers */}
          {effectiveStages.map((stage, i) => {
            const cur = stage.current && !rej;
            const fut = !stage.reached && !stage.current;
            const first = i === 0;
            const above = !v && i % 2 === 0;
            const pct = effectiveStages.length > 1 ? (i / (effectiveStages.length - 1)) * 100 : 50;
            const markerStyle = v
              ? { top: `${pct}%`, left: "50%", transform: "translate(-50%, -50%)" }
              : { left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" };

            const markerContent = (
              <div className={`relative flex ${v ? "items-center" : "flex-col items-center"}`}>
                <span
                  data-testid="stage-marker"
                  className={`relative z-10 inline-flex rounded-full ${
                    rej ? "h-3 w-3 border-2 border-red-600 bg-red-600"
                    : cur ? "h-4 w-4 border-[3px] border-ink bg-paper"
                    : fut ? "h-3 w-3 border-2 border-gray-300 bg-paper"
                    : first ? "h-3 w-3 bg-ink"
                    : "h-3 w-3 bg-ink"
                  }`}
                />
                <div
                  data-testid="stage-label"
                  className={`absolute ${
                    v ? "left-5 top-1/2 -translate-y-1/2"
                    : above ? "bottom-5" : "top-5"
                  }`}
                >
                  <span className={`whitespace-nowrap text-sm ${cur ? "font-semibold text-ink" : fut ? "text-gray-400" : "text-gray-500"}`}>
                    {t(stage.status)}
                  </span>
                  {cur && stage.date && (
                    <span className="block whitespace-nowrap text-xs text-ink-muted">
                      {stage.date}
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <div key={stage.status} className="absolute" style={markerStyle}>
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
