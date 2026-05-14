import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...idea,
    supportCount: idea._count.votes,
    commentCount: idea._count.comments,
  });
}
