"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { statusToBadgeVariant } from "@/lib/status";
import Image from "next/image";

interface IdeaCardFirstImage {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  status: string;
  supportCount: number;
  commentCount: number;
  firstImage: IdeaCardFirstImage | null;
  rejectionNote?: string | null;
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  INFRASTRUCTURE: "bg-civic-orange-light text-civic-orange",
  EDUCATION: "bg-civic-blue-light text-civic-blue",
  ENVIRONMENT: "bg-civic-teal-light text-civic-teal",
  CULTURE: "bg-purple-50 text-purple-700",
  SAFETY: "bg-red-50 text-red-700",
  TRANSPORT: "bg-cyan-50 text-cyan-700",
  HEALTH: "bg-pink-50 text-pink-700",
  OTHER: "bg-paper-muted text-ink-muted",
};

export function IdeaCard({
  id,
  title,
  description,
  category,
  district,
  status,
  supportCount,
  commentCount,
  firstImage,
  rejectionNote,
  compact = false,
}: IdeaCardProps) {
  const tc = useTranslations("Categories");
  const td = useTranslations("Districts");
  const ts = useTranslations("Statuses");
  const ti = useTranslations("Ideas");

  const href = `/ideas/${id}`;
  const catColor = categoryColors[category] || categoryColors.OTHER;

  if (compact) {
    return (
      <a
        href={href}
        className="group flex gap-3 rounded-sm border border-ink/8 bg-paper p-3 transition hover:border-ink/20 hover:bg-paper-muted/50"
      >
        {firstImage ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm">
            <Image
              src={firstImage.url}
              alt={firstImage.alt || title}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : (
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm text-xs font-medium ${catColor}`}>
            {tc(category as Parameters<typeof tc>[0]).slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-ink group-hover:text-civic-blue">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
            <Badge variant={statusToBadgeVariant(status)}>
              {ts(status as Parameters<typeof ts>[0])}
            </Badge>
            {status === "REJECTED" && (
              <Badge variant="rejected">{ti("notEligible")}</Badge>
            )}
            <span>{ti("supportCount", { count: supportCount })}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      className="group flex flex-col overflow-hidden rounded-sm border border-ink/8 bg-paper transition hover:border-ink/20"
    >
      <div className="relative aspect-[16/9] w-full bg-paper-muted">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-sm font-medium ${catColor}`}>
            {tc(category as Parameters<typeof tc>[0])}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-semibold text-ink group-hover:text-civic-blue transition">
            {title}
          </h3>
          <div className="flex gap-1">
            <Badge variant={statusToBadgeVariant(status)}>
              {ts(status as Parameters<typeof ts>[0])}
            </Badge>
            {status === "REJECTED" && (
              <Badge variant="rejected">{ti("notEligible")}</Badge>
            )}
          </div>
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">
          {description}
        </p>

        {status === "REJECTED" && rejectionNote && (
          <p className="mt-1.5 text-xs text-red-600 line-clamp-1">
            {rejectionNote}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-ink-muted">
          <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${catColor}`}>
            {tc(category as Parameters<typeof tc>[0])}
          </span>
          <span>{td(district as Parameters<typeof td>[0])}</span>
          <span className="text-ink/20">·</span>
          <span>{ti("supportCount", { count: supportCount })}</span>
          <span>{ti("commentCount", { count: commentCount })}</span>
        </div>
      </div>
    </a>
  );
}
