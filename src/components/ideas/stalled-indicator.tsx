"use client";

import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

export type StalledIndicatorProps = {
  label: string;
  daysAgo: number;
};

export function StalledIndicator({
  label,
  daysAgo,
}: StalledIndicatorProps): ReactElement | null {
  const t = useTranslations("Pipeline");

  if (!label) {
    return null;
  }

  return (
    <div className="text-amber-500 text-sm mt-1">
      <span>
        {t("waitingFor")}: {label}
      </span>
      <span className="ml-1">
        {daysAgo} {t("daysAgo")}
      </span>
    </div>
  );
}
