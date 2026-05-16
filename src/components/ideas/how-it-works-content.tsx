"use client";

import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import type { Status } from "@prisma/client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { PipelineTrack, type PipelineStage } from "./pipeline-track";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import { statusToBadgeVariant } from "@/lib/status";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";
import { TERMINAL_STATUSES } from "@/lib/transitions";

const CREATOR_URL = "https://gergobalogh.me";

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

function buildShowcaseStages(
  t: (key: string) => string,
  activeStage: Status
): PipelineStage[] {
  const activeIndex = PIPELINE_STAGES.indexOf(activeStage);

  return PIPELINE_STAGES.map((status, index) => ({
    status,
    label: t(status),
    reached: index < activeIndex,
    current: status === activeStage,
    date: null,
  }));
}

export function HowItWorksContent(): JSX.Element {
  const t = useTranslations("HowItWorks");
  const s = useTranslations("Statuses");

  const [activeStage, setActiveStage] = useState<Status>(
    PIPELINE_STAGES[0] as Status
  );
  const [isMobilePipeline, setIsMobilePipeline] = useState(false);

  const cardRefs = useRef<Map<string, Element>>(new Map());

  const showcaseStages = buildShowcaseStages(s, activeStage);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateMobileState = () => setIsMobilePipeline(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileState);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const stage = visibleEntries[0]?.target.id.toUpperCase() as
          | Status
          | undefined;

        if (stage && PIPELINE_STAGES.includes(stage)) {
          setActiveStage(stage);
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0.35, 0.6],
      }
    );

    PIPELINE_STAGES.forEach((status) => {
      const element = cardRefs.current.get(status);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleStageClick = (status: Status) => {
    const element = document.getElementById(status.toLowerCase());
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreatorClick = () => {
    trackEvent("creator_link_click", {
      page: "how-it-works",
      destination: CREATOR_URL,
    });
  };

  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold text-ink sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
          {t("subtitle")}
        </p>
      </header>

      <section className="mt-10">
        <div
          data-testid="sticky-pipeline-container"
          className="sticky top-20 z-10 border-y border-gray-200 bg-paper/95 py-4 backdrop-blur sm:py-5"
        >
          <div
            data-testid="active-stage-indicator"
            data-active-stage={activeStage}
          >
            <PipelineTrack
              stages={showcaseStages}
              showcase={true}
              isMobile={isMobilePipeline}
              onStageClick={handleStageClick}
            />
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div>
            <h2 className="text-2xl font-semibold text-ink">
              {t("forwardSection")}
            </h2>
          </div>

          <div className="space-y-10">
            {PIPELINE_STAGES.map((status) => {
              const descKey = STAGE_DESC_KEYS[status];
              const nextStage = NEXT_STAGE_MAP[status];
              return (
                <div
                  key={status}
                  id={status.toLowerCase()}
                  ref={setCardRef(status)}
                  className="stage-card flex min-h-[40vh] scroll-mt-56 flex-col justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <Badge variant={statusToBadgeVariant(status)}>
                    {s(status)}
                  </Badge>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-700">
                    {t(descKey)}
                  </p>
                  {nextStage && (
                    <p className="mt-5 text-sm text-gray-500">
                      {t("nextStep", { stage: s(nextStage) })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-8 border-t border-gray-200 pt-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div>
          <h2 className="text-2xl font-semibold text-ink">
            {t("terminalSection")}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TERMINAL_STATUSES.map((status) => {
            const descKey = TERMINAL_DESC_KEYS[status];
            return (
              <div
                key={status}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
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
                  <p className="mt-3 leading-7 text-gray-700">{t(descKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-14 flex flex-col items-start gap-5 border-t border-gray-200 pt-10">
        <Link
          href="/ideas"
          className="inline-flex items-center rounded-md bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-muted"
        >
          {t("cta")}
        </Link>
        <p className="text-sm text-gray-500">
          {t("creatorCredit")}{" "}
          <a
            href={CREATOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCreatorClick}
            className="font-medium text-ink underline decoration-gray-300 underline-offset-4 hover:decoration-ink"
          >
            Gergo Balogh
          </a>
        </p>
      </div>
    </main>
  );
}
