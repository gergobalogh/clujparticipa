import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";
import { CommentStatus } from "@prisma/client";

const moderateSchema = z.object({
  status: z.nativeEnum(CommentStatus),
  reason: z.string().min(1).max(2000),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateAdminAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

  const { id } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = moderateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status: newStatus, reason } = parsed.data;

  if (newStatus === "FLAGGED") {
    return NextResponse.json(
      { error: "FLAGGED status can only be set by the auto-moderation system" },
      { status: 400 }
    );
  }

  if (newStatus === comment.status) {
    return NextResponse.json(
      { error: `Comment is already ${comment.status.toLowerCase()}` },
      { status: 409 }
    );
  }

  const action =
    comment.status === "FLAGGED" && newStatus === "VISIBLE"
      ? "APPROVE"
      : newStatus === "HIDDEN"
        ? "HIDE"
        : "RESTORE";

  const updated = await prisma.$transaction(async (tx) => {
    const updatedComment = await tx.comment.update({
      where: { id },
      data: { status: newStatus },
    });

    await tx.moderationEvent.create({
      data: {
        targetType: "COMMENT",
        targetId: id,
        action,
        reason,
        changedBy: "admin",
      },
    });

    return updatedComment;
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
  });
}
