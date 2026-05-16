import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HowItWorksContent } from "@/components/ideas/how-it-works-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HowItWorks");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
