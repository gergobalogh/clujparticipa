"use client";

import { useState } from "react";
import type { JSX } from "react";
import { useTranslations } from "next-intl";

export type TimelineEntry = {
  id: string;
  date: string;
  fromStatus: string | null;
  toStatus: string;
  actorRole: string;
  note: string;
};

export type StatusChangeTimelineProps = {
  entries: TimelineEntry[];
  noUpdatesLabel: string;
  viewHistoryLabel: string;
};

const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));

function TimelineEntryRow({
  entry,
  translateStatus,
}: {
  entry: TimelineEntry;
  translateStatus: (key: string) => string;
}): JSX.Element {
  const formattedDate = formatDate(entry.date);

  return (
    <div className="relative pl-6 pb-4 border-l border-gray-200 last:border-l-0">
      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-400" />
      <div className="text-sm text-gray-500">{formattedDate}</div>
      <div className="text-sm font-medium">
        {entry.fromStatus ? (
          <>
            <span>{translateStatus(entry.fromStatus)}</span>
            {" → "}
            <span>{translateStatus(entry.toStatus)}</span>
          </>
        ) : (
          <span>{translateStatus(entry.toStatus)}</span>
        )}
      </div>
      <div className="text-sm text-gray-600">
        {entry.actorRole}
      </div>
      {entry.note && (
        <div className="text-sm text-gray-700">{entry.note}</div>
      )}
    </div>
  );
}

export function StatusChangeTimeline({
  entries,
  noUpdatesLabel,
  viewHistoryLabel,
}: StatusChangeTimelineProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const ts = useTranslations("Statuses");

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">{noUpdatesLabel}</p>;
  }

  const toggleExpanded = (): void => setExpanded((prev) => !prev);

  return (
    <div>
      <button
        type="button"
        onClick={toggleExpanded}
        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
      >
        {viewHistoryLabel}
      </button>

      {expanded && (
        <div className="mt-3 space-y-0">
          {entries.map((entry) => (
            <TimelineEntryRow
              key={entry.id}
              entry={entry}
              translateStatus={(key) => ts(key as Parameters<typeof ts>[0])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
