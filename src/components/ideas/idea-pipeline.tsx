"use client";

import React from "react";
import type { Status } from "@prisma/client";
import { IdeaPipelineStage } from "./idea-pipeline-stage";
import { StalledIndicator } from "./stalled-indicator";

export type PipelineStage = {
  status: Status;
  label: string;
  reached: boolean;
  current: boolean;
  date: string | null;
};

export type IdeaPipelineProps = {
  stages: PipelineStage[];
  exceptionState?: "REJECTED" | "MERGED" | "RETURNED" | "STALLED";
  stalledLabel?: string;
  stalledDays?: number;
  isMobile?: boolean;
};

/** Connector line between pipeline stages. */
function StageConnector({ isVertical }: { isVertical: boolean }) {
  if (isVertical) {
    return <div className="ml-1.5 w-0.5 h-4 bg-gray-200" />;
  }
  return <div className="h-0.5 flex-1 bg-gray-200 min-w-4" />;
}

/** Stalled indicator section, rendered only when stalled. */
function StalledSection({
  exceptionState,
  stalledLabel,
  stalledDays,
}: {
  exceptionState?: string;
  stalledLabel?: string;
  stalledDays?: number;
}) {
  if (exceptionState !== "STALLED" || !stalledLabel) {
    return null;
  }
  return <StalledIndicator label={stalledLabel} daysAgo={stalledDays ?? 0} />;
}

export function IdeaPipeline({
  stages,
  exceptionState,
  stalledLabel,
  stalledDays,
  isMobile,
}: IdeaPipelineProps): React.JSX.Element {
  const layoutDirection = isMobile ? "flex-col" : "sm:flex-row flex-row";
  const stageAlignment = isMobile ? "items-start" : "sm:items-center items-center";

  return (
    <div>
      <div
        data-testid="pipeline"
        className={`flex ${layoutDirection} ${stageAlignment} gap-0`}
      >
        {stages.map((stage, index) => (
          <React.Fragment key={stage.status}>
            <IdeaPipelineStage stage={stage} exceptionState={exceptionState} />
            {index < stages.length - 1 && (
              <StageConnector isVertical={isMobile ?? false} />
            )}
          </React.Fragment>
        ))}
      </div>
      <StalledSection
        exceptionState={exceptionState}
        stalledLabel={stalledLabel}
        stalledDays={stalledDays}
      />
    </div>
  );
}
