"use client";

import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type { Status } from "@prisma/client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PipelineTrack, type PipelineStage } from "./pipeline-track";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";
import { TERMINAL_STATUSES } from "@/lib/transitions";

const TERMINAL_DOT_COLORS: Record<string, string> = {
  REJECTED: "bg-red-500",
  NEEDS_REVISION: "bg-amber-500",
  MERGED: "bg-purple-500",
  WITHDRAWN: "bg-gray-400",
};

const STAGE_DESC_KEYS: Record<string, string> = {
  SUBMITTED: "submittedDesc",
  IN_VOTING: "inVotingDesc",
  SELECTED: "selectedDesc",
  ACCEPTED: "acceptedDesc",
  IN_PROGRESS: "inProgressDesc",
  COMPLETED: "completedDesc",
};

const TERMINAL_DESC_KEYS: Record<string, string> = {
  REJECTED: "rejectedDesc",
  NEEDS_REVISION: "needsRevisionDesc",
  MERGED: "mergedDesc",
  WITHDRAWN: "withdrawnDesc",
};

const NEXT_STAGE_MAP: Record<string, Status | null> = {
  SUBMITTED: "IN_VOTING" as Status,
  IN_VOTING: "SELECTED" as Status,
  SELECTED: "ACCEPTED" as Status,
  ACCEPTED: "IN_PROGRESS" as Status,
  IN_PROGRESS: "COMPLETED" as Status,
  COMPLETED: null,
};

function buildShowcaseStages(t: (key: string) => string): PipelineStage[] {
  return PIPELINE_STAGES.map((status) => ({
    status,
    label: t(status),
    reached: true,
    current: false,
    date: null,
  }));
}

export function HowItWorksContent(): JSX.Element {
  const t = useTranslations("HowItWorks");
  const s = useTranslations("Statuses");

  const [activeStage, setActiveStage] = useState<Status>(
    PIPELINE_STAGES[0] as Status
  );
  const [isSticky, setIsSticky] = useState(true);

  const cardRefs = useRef<Map<string, Element>>(new Map());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  const showcaseStages = buildShowcaseStages(s);

  // IntersectionObserver for stage cards → activeStage
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const stage = id.toUpperCase() as Status;
            if (PIPELINE_STAGES.includes(stage)) {
              setActiveStage(stage);
            }
          }
        }
      },
      { threshold: 0.5 }
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    observersRef.current.push(observer);

    return () => observer.disconnect();
  }, []);

  // IntersectionObserver for sentinel → sticky toggle
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsSticky(!entry.isIntersecting);
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    observersRef.current.push(observer);

    return () => observer.disconnect();
  }, []);

  const handleStageClick = (status: Status) => {
    const element = document.getElementById(status.toLowerCase());
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Title and subtitle */}
      <h1 className="text-3xl font-bold text-ink">{t("title")}</h1>
      <p className="mt-2 text-lg text-gray-600">{t("subtitle")}</p>

      {/* Sticky pipeline */}
      <div
        data-testid="sticky-pipeline-container"
        className={`z-10 bg-white ${
          isSticky ? "sticky top-16" : "relative"
        }`}
      >
        <div data-testid="active-stage-indicator" data-active-stage={activeStage}>
          <PipelineTrack
            stages={showcaseStages}
            showcase={true}
            onStageClick={handleStageClick}
          />
        </div>
      </div>

      {/* Forward section heading */}
      <h2 className="mt-8 text-2xl font-semibold text-ink">
        {t("forwardSection")}
      </h2>

      {/* Stage cards */}
      <div className="mt-6 space-y-6">
        {PIPELINE_STAGES.map((status) => {
          const descKey = STAGE_DESC_KEYS[status];
          const nextStage = NEXT_STAGE_MAP[status];
          return (
            <div
              key={status}
              id={status.toLowerCase()}
              ref={setCardRef(status)}
              className="stage-card scroll-mt-24 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <Badge variant={statusToBadgeVariant(status)}>
                {s(status)}
              </Badge>
              <p className="mt-3 text-gray-700">{t(descKey)}</p>
              {nextStage && (
                <p className="mt-2 text-sm text-gray-500">
                  {t("nextStep", { stage: s(nextStage) })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Sentinel for sticky unstick */}
      <div ref={sentinelRef} data-testid="sticky-sentinel" className="h-0" />

      {/* Terminal section */}
      <h2 className="mt-10 text-2xl font-semibold text-ink">
        {t("terminalSection")}
      </h2>

      <div className="mt-6 space-y-4">
        {TERMINAL_STATUSES.map((status) => {
          const descKey = TERMINAL_DESC_KEYS[status];
          return (
            <div
              key={status}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <span
                data-testid="terminal-dot"
                data-status={status}
                className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${TERMINAL_DOT_COLORS[status]}`}
              />
              <div>
                <Badge variant={statusToBadgeVariant(status)}>
                  {s(status)}
                </Badge>
                <p className="mt-2 text-gray-700">{t(descKey)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA section */}
      <div className="mt-10 flex flex-col items-center gap-3 border-t border-gray-200 pt-8">
        <Link
          href="/ideas"
          className="inline-flex items-center rounded-md bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-muted"
        >
          {t("cta")}
        </Link>
      </div>
    </main>
  );
}
