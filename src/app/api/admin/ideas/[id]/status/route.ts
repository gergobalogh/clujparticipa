import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";
import { isValidTransition } from "@/lib/transitions";
import { z } from "zod";
import { Status } from "@prisma/client";

const statusSchema = z.object({
  status: z.nativeEnum(Status),
  note: z.string().min(1).max(2000),
  force: z.boolean().optional().default(false),
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

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status: newStatus, note, force } = parsed.data;

  if (newStatus === idea.status) {
    return NextResponse.json(
      { error: "Idea is already in this status" },
      { status: 409 }
    );
  }

  if (!isValidTransition(idea.status, newStatus) && !force) {
    return NextResponse.json(
      {
        error: `Invalid transition from ${idea.status} to ${newStatus}. Use force:true to override.`,
        from: idea.status,
        to: newStatus,
      },
      { status: 422 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedIdea = await tx.idea.update({
      where: { id },
      data: { status: newStatus },
    });

    await tx.statusChange.create({
      data: {
        ideaId: id,
        fromStatus: idea.status,
        toStatus: newStatus,
        note,
        changedBy: "admin",
      },
    });

    await tx.moderationEvent.create({
      data: {
        targetType: "IDEA",
        targetId: id,
        action: "STATUS_CHANGE",
        reason: note,
        changedBy: "admin",
      },
    });

    return updatedIdea;
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt,
  });
}
