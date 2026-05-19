import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

  const flaggedComments = await prisma.comment.findMany({
    where: { status: "FLAGGED" },
    select: {
      id: true,
      text: true,
      status: true,
      createdAt: true,
      idea: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const autoFlagEvents = await prisma.moderationEvent.findMany({
    where: {
      targetType: "COMMENT",
      action: "AUTO_FLAG",
      targetId: { in: flaggedComments.map((c) => c.id) },
    },
    select: {
      targetId: true,
      reason: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const reasonByCommentId = new Map<string, string>();
  for (const event of autoFlagEvents) {
    if (!reasonByCommentId.has(event.targetId)) {
      reasonByCommentId.set(event.targetId, event.reason);
    }
  }

  const comments = flaggedComments.map((c) => ({
    id: c.id,
    text: c.text,
    status: c.status,
    createdAt: c.createdAt,
    ideaId: c.idea.id,
    ideaTitle: c.idea.title,
    flaggedCategories: parseFlaggedCategories(reasonByCommentId.get(c.id) ?? ""),
  }));

  const count = await prisma.comment.count({
    where: { status: "FLAGGED" },
  });

  return NextResponse.json({ comments, count });
}

function parseFlaggedCategories(reason: string): string[] {
  if (!reason.startsWith("auto_flag:")) return [];
  const categories = reason.slice("auto_flag:".length);
  return categories
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}
