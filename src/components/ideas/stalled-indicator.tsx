"use client";

import { useTranslations } from "next-intl";
import type { JSX } from "react";

export type StalledIndicatorProps = {
  label: string;
  daysAgo: number;
  fullWidth?: boolean;
};

export function StalledIndicator({
  label,
  daysAgo,
  fullWidth = false,
}: StalledIndicatorProps): JSX.Element | null {
  const t = useTranslations("Pipeline");
  const stalledT = useTranslations("Stalled");

  if (!label) {
    return null;
  }

  return (
    <div
      data-testid="stalled-indicator"
      className={`text-amber-500 text-sm mt-1${fullWidth ? " w-full" : ""}`}
    >
      <span>
        {t("waitingFor")}: {stalledT(label as Parameters<typeof stalledT>[0])}
      </span>
      <span className="ml-1">
        {daysAgo} {t("daysAgo")}
      </span>
    </div>
  );
}
