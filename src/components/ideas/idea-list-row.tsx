"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import { resolveCategoryListColor } from "@/lib/category-colors";
import Image from "next/image";

interface IdeaListRowFirstImage {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface IdeaListRowProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  district: string;
  status: string;
  supportCount: number;
  commentCount: number;
  firstImage?: IdeaListRowFirstImage | null;
}

export function IdeaListRow({
  id,
  title,
  description,
  category,
  district,
  status,
  supportCount,
  commentCount,
  firstImage,
}: IdeaListRowProps) {
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const ts = useTranslations("Statuses");
  const ti = useTranslations("Ideas");

  const href = `/ideas/${id}`;
  const catColor = resolveCategoryListColor(category);

  return (
    <a
      href={href}
      className="group block border-b border-ink/8 py-3 transition hover:bg-paper-muted/50 last:border-b-0"
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          {/* Meta line: district, category, status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`uppercase tracking-wide font-semibold ${catColor}`}>
              {tc(category as Parameters<typeof tc>[0])}
            </span>
            <span className="text-ink/20">·</span>
            <span className="uppercase tracking-wide font-semibold text-ink-muted">
              {td(district as Parameters<typeof td>[0])}
            </span>
            <Badge variant={statusToBadgeVariant(status)}>
              {ts(status as Parameters<typeof ts>[0])}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="mt-1 font-serif text-base font-semibold text-ink group-hover:text-civic-blue transition leading-snug">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mt-1 text-sm text-ink-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Support / comment counts */}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {ti("supportCount", { count: supportCount })}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {ti("commentCount", { count: commentCount })}
            </span>
          </div>
        </div>

        {/* Thumbnail on desktop */}
        {firstImage && (
          <div className="hidden sm:block relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border border-ink/8">
            <Image
              src={firstImage.url}
              alt={firstImage.alt || title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
      </div>
    </a>
  );
}
