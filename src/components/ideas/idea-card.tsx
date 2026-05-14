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
  INFRASTRUCTURE: "bg-orange-100 text-orange-700",
  EDUCATION: "bg-blue-100 text-blue-700",
  ENVIRONMENT: "bg-green-100 text-green-700",
  CULTURE: "bg-purple-100 text-purple-700",
  SAFETY: "bg-red-100 text-red-700",
  TRANSPORT: "bg-cyan-100 text-cyan-700",
  HEALTH: "bg-pink-100 text-pink-700",
  OTHER: "bg-slate-100 text-slate-700",
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
        className="group flex gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm"
      >
        {firstImage ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={firstImage.url}
              alt={firstImage.alt || title}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : (
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md text-xs font-medium ${catColor}`}>
            {tc(category as Parameters<typeof tc>[0]).slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-slate-900 group-hover:text-blue-700">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
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
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-sm"
    >
      <div className="relative aspect-[16/9] w-full bg-slate-100">
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
          <h3 className="font-medium text-slate-900 group-hover:text-blue-700">
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

        <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
          {description}
        </p>

        {status === "REJECTED" && rejectionNote && (
          <p className="mt-1.5 text-xs text-red-600 line-clamp-1">
            {rejectionNote}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-500">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${catColor}`}>
            {tc(category as Parameters<typeof tc>[0])}
          </span>
          <span>{td(district as Parameters<typeof td>[0])}</span>
          <span className="text-slate-300">·</span>
          <span>{ti("supportCount", { count: supportCount })}</span>
          <span>{ti("commentCount", { count: commentCount })}</span>
        </div>
      </div>
    </a>
  );
}
