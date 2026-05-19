"use client";

import { Copy, Share2 } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type IdeaShareRowProps = {
  ideaId: string;
  title: string;
  category: string;
  district: string;
  locale: string;
};

function buildShareUrl(ideaId: string, source: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/ideas/${ideaId}?utm_source=${source}`;
}

function buildWhatsAppUrl(ideaTitle: string, shareUrl: string, ctaText: string): string {
  const text = `${ideaTitle} -- ${ctaText} ${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function buildFacebookUrl(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function IdeaShareRow({
  ideaId,
  title,
  category,
  district,
  locale,
}: IdeaShareRowProps) {
  const t = useTranslations("Share");

  const copyUrl = buildShareUrl(ideaId, "copy");
  const whatsappUrl = buildWhatsAppUrl(title, buildShareUrl(ideaId, "whatsapp"), t("ctaText"));
  const facebookUrl = buildFacebookUrl(buildShareUrl(ideaId, "facebook"));

  const handleCopy = async () => {
    await copyToClipboard(copyUrl);
    trackEvent("idea_share", { channel: "copy", ideaId });
    toast.success(t("linkCopied"));
  };

  const handleWhatsApp = () => {
    const opened = window.open(whatsappUrl, "_blank");
    if (!opened) {
      copyToClipboard(buildShareUrl(ideaId, "whatsapp"));
    }
  };

  const handleFacebook = () => {
    window.open(facebookUrl, "_blank");
  };

  return (
    <div className="flex items-center gap-2" data-testid="share-row">
      <button
        type="button"
        onClick={handleWhatsApp}
        aria-label={t("shareOnWhatsApp")}
        className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-ink/10 bg-paper text-ink transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Share2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={handleFacebook}
        aria-label={t("shareOnFacebook")}
        className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-ink/10 bg-paper text-ink transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Share2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={t("copyLink")}
        className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-ink/10 bg-paper text-ink transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
      >
        <Copy className="h-5 w-5" />
      </button>
    </div>
  );
}
