"use client";

import { useTranslations } from "next-intl";

interface LiveBadgeProps {
  votingOpen: boolean;
  totalIdeas: number;
}

export function LiveBadge({ votingOpen, totalIdeas }: LiveBadgeProps) {
  const t = useTranslations("Home");

  if (!votingOpen && totalIdeas <= 0) {
    return null;
  }

  return (
    <span className="bg-ink text-paper animate-pulse motion-reduce:animate-none rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
      {t("liveBadge")}
    </span>
  );
}
