"use client";

import { useTranslations } from "next-intl";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import { resolveCategoryListColor } from "@/lib/category-colors";

interface EditorialIdeaCardProps {
  id: string;
  title: string;
  category: string;
  district: string;
  status: string;
  supportCount: number;
  commentCount: number;
}

export function EditorialIdeaCard({
  id,
  title,
  category,
  district,
  status,
  supportCount,
  commentCount,
}: EditorialIdeaCardProps) {
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const ts = useTranslations("Statuses");
  const ti = useTranslations("Ideas");

  const catColor = resolveCategoryListColor(category);

  return (
    <a
      href={`/ideas/${id}`}
      className="group block py-3 transition hover:bg-paper-muted/50"
    >
      {/* Meta line: neighborhood · status */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`uppercase tracking-wide font-semibold ${catColor}`}
        >
          {td(district as Parameters<typeof td>[0])}
        </span>
        <span className="text-ink/20">·</span>
        <Badge variant={statusToBadgeVariant(status)}>
          {ts(status as Parameters<typeof ts>[0])}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="mt-1 font-serif font-medium text-base text-ink group-hover:underline underline-offset-8 leading-snug">
        {title}
      </h3>

      {/* Support / comment counts */}
      <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" />
          {ti("supportCount", { count: supportCount })}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {ti("commentCount", { count: commentCount })}
        </span>
      </div>
    </a>
  );
}
