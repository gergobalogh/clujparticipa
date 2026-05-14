"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";

type VotingCountdownProps = {
  endsAt: string;
};

export function VotingCountdown({ endsAt }: VotingCountdownProps) {
  const t = useTranslations("IdeaDetail");
  const [diff, setDiff] = useState(() => {
    const end = new Date(endsAt).getTime();
    return end - Date.now();
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => {
      setDiff(end - Date.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [endsAt]);

  if (diff <= 0) {
    return (
      <p className="text-sm font-medium text-red-600">
        {t("votingClosed")}
      </p>
    );
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${t("votingDays")}`);
  if (hours > 0) parts.push(`${hours} ${t("votingHours")}`);
  parts.push(`${minutes} ${t("votingMinutes")}`);

  return (
    <p className="text-sm text-ink-muted">
      {t("votingClosesIn")} {parts.join(" ")}
    </p>
  );
}
