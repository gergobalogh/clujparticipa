"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { JSX } from "react";

export type ExceptionStateProps = {
  exceptionType: "REJECTED" | "NEEDS_REVISION" | "MERGED" | "WITHDRAWN" | "RETURNED";
  reason: string | null;
  parentIdeaId?: string | null;
  parentIdeaTitle?: string | null;
  rejectionStage?: string | null;
  resubmitUrl?: string | null;
  similarIdeasUrl?: string | null;
  hasSimilarIdeas?: boolean;
};

const markerColor = (exceptionType: ExceptionStateProps["exceptionType"]): string => {
  switch (exceptionType) {
    case "REJECTED":
      return "bg-red-500";
    case "MERGED":
      return "bg-purple-500";
    case "RETURNED":
    case "NEEDS_REVISION":
      return "bg-amber-500";
    case "WITHDRAWN":
      return "bg-gray-400";
  }
};

function RejectedContent({
  reason,
  resubmitUrl,
  similarIdeasUrl,
  hasSimilarIdeas,
  translate,
}: {
  reason: string | null;
  resubmitUrl: string | null;
  similarIdeasUrl: string | null;
  hasSimilarIdeas: boolean;
  translate: (key: string) => string;
}) {
  const displayReason = reason ?? translate("contactUs");

  return (
    <div className="space-y-3">
      <p className="text-gray-700">{displayReason}</p>
      <div className="flex flex-wrap gap-3">
        {hasSimilarIdeas && similarIdeasUrl ? (
          <Link
            href={similarIdeasUrl}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {translate("supportSimilar")}
          </Link>
        ) : (
          <span className="text-sm text-gray-500">{translate("noSimilarIdeas")}</span>
        )}
        {resubmitUrl && (
          <Link
            href={resubmitUrl}
            className="inline-flex items-center rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            {translate("reviseAndResubmit")}
          </Link>
        )}
      </div>
    </div>
  );
}

function MergedContent({
  parentIdeaId,
  parentIdeaTitle,
  translate,
}: {
  parentIdeaId: string | null;
  parentIdeaTitle: string | null;
  translate: (key: string) => string;
}) {
  const parentAvailable = parentIdeaId && parentIdeaTitle;

  return (
    <div className="space-y-2">
      <p className="text-gray-700">{translate("mergedWith")}</p>
      {parentAvailable ? (
        <Link
          href={`/ideas/${parentIdeaId}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {parentIdeaTitle}
        </Link>
      ) : (
        <span className="text-gray-500">{translate("parentUnavailable")}</span>
      )}
    </div>
  );
}

function ReturnedContent({
  reason,
  resubmitUrl,
  translate,
}: {
  reason: string | null;
  resubmitUrl: string | null;
  translate: (key: string) => string;
}) {
  const feedback = reason?.replace(/^\[RETURNED\]\s*/, "") ?? "";

  return (
    <div className="space-y-3">
      {feedback && <p className="text-gray-700">{feedback}</p>}
      {resubmitUrl && (
        <Link
          href={resubmitUrl}
          className="inline-flex items-center rounded-md border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          {translate("reviseAndResubmit")}
        </Link>
      )}
    </div>
  );
}

export function ExceptionState({
  exceptionType,
  reason,
  parentIdeaId,
  parentIdeaTitle,
  resubmitUrl,
  similarIdeasUrl,
  hasSimilarIdeas = true,
}: ExceptionStateProps): JSX.Element {
  const translate = useTranslations("Exception");

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-testid="exception-container"
    >
      <div className="flex items-start gap-3">
        <div
          data-testid="exception-marker"
          className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${markerColor(exceptionType)}`}
        />
        <div className="flex-1">
          {exceptionType === "REJECTED" && (
            <RejectedContent
              reason={reason}
              resubmitUrl={resubmitUrl ?? null}
              similarIdeasUrl={similarIdeasUrl ?? null}
              hasSimilarIdeas={hasSimilarIdeas}
              translate={translate}
            />
          )}
          {exceptionType === "MERGED" && (
            <MergedContent
              parentIdeaId={parentIdeaId ?? null}
              parentIdeaTitle={parentIdeaTitle ?? null}
              translate={translate}
            />
          )}
          {exceptionType === "RETURNED" && (
            <ReturnedContent
              reason={reason}
              resubmitUrl={resubmitUrl ?? null}
              translate={translate}
            />
          )}
          {(exceptionType === "NEEDS_REVISION") && (
            <ReturnedContent
              reason={reason}
              resubmitUrl={resubmitUrl ?? null}
              translate={translate}
            />
          )}
          {exceptionType === "WITHDRAWN" && (
            <div className="space-y-2">
              <p className="text-gray-700">{reason ?? translate("contactUs")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
