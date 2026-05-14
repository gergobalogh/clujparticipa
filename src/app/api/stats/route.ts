import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalIdeas,
    totalVotes,
    totalComments,
    recentIdeas,
    statusCounts,
  ] = await Promise.all([
    prisma.idea.count(),
    prisma.vote.count(),
    prisma.comment.count({ where: { status: "VISIBLE" } }),
    prisma.idea.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        district: true,
        status: true,
        createdAt: true,
        _count: { select: { votes: true, comments: true } },
        images: {
          where: { order: 0 },
          select: { url: true, alt: true, width: true, height: true },
          take: 1,
        },
      },
    }),
    prisma.idea.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status])
  );

  return NextResponse.json({
    totalIdeas,
    totalVotes,
    totalComments,
    recentIdeas: recentIdeas.map((idea) => ({
      ...idea,
      supportCount: idea._count.votes,
      commentCount: idea._count.comments,
      firstImage: idea.images[0] || null,
      images: undefined,
    })),
    statusCounts: statusMap,
  });
}
