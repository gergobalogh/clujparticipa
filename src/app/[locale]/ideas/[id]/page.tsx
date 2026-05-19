import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildOgDescription } from "@/lib/og-metadata";
import IdeaDetailClient from "@/components/ideas/idea-detail-client";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;

  const t = await getTranslations("Categories");
  const td = await getTranslations("Districts");

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clujparticipa.digital";

  if (!idea) {
    return {
      openGraph: {
        type: "website",
        siteName: "ClujParticipa",
      },
    };
  }

  const category = t(idea.category as Parameters<typeof t>[0]);
  const district = td(idea.district as Parameters<typeof td>[0]);

  return {
    title: idea.title,
    openGraph: {
      title: idea.title,
      description: buildOgDescription({
        description: idea.description,
        title: idea.title,
        category,
        district,
      }),
      url: `${appUrl}/${locale}/ideas/${id}`,
      type: "website",
      siteName: "ClujParticipa",
    },
  };
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      votes: { select: { direction: true } },
      _count: { select: { votes: true, comments: true } },
      statusChanges: {
        orderBy: { createdAt: "asc" },
      },
      images: {
        orderBy: { order: "asc" },
      },
      feasibilityNote: true,
      progressUpdates: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!idea) {
    notFound();
  }

  const ideaData = {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    district: idea.district,
    status: idea.status,
    latitude: idea.latitude,
    longitude: idea.longitude,
    createdAt: idea.createdAt.toISOString(),
    supportCount: idea._count.votes,
    commentCount: idea._count.comments,
    statusChanges: idea.statusChanges.map((sc) => ({
      ...sc,
      createdAt: sc.createdAt.toISOString(),
    })),
    images: idea.images.map((img) => ({
      ...img,
      createdAt: img.createdAt.toISOString(),
    })),
    feasibilityNote: idea.feasibilityNote
      ? { ...idea.feasibilityNote, createdAt: idea.feasibilityNote.createdAt.toISOString() }
      : null,
    progressUpdates: idea.progressUpdates.map((pu) => ({
      ...pu,
      createdAt: pu.createdAt.toISOString(),
    })),
  };

  return <IdeaDetailClient idea={ideaData} />;
}
