import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { moderateText } from "@/lib/openai-moderation";
import { callOpenAIModeration } from "@/lib/openai-moderation-adapter";
import { z } from "zod";

// ── GET /api/ideas/[id]/comments ── list visible comments ──

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({ where: { id }, select: { id: true } });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { ideaId: id, status: "VISIBLE" },
    orderBy: { createdAt: "asc" },
    include: {
      replies: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Return only top-level comments (no parentId) with nested replies
  const topLevel = comments.filter((c) => c.parentId === null);

  return NextResponse.json({ comments: topLevel });
}

// ── POST /api/ideas/[id]/comments ── create comment ──

const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  parentId: z.string().optional(),
  participantToken: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAuthSession();

  const idea = await prisma.idea.findUnique({ where: { id }, select: { id: true } });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Merge header token if body doesn't have one
  if (
    typeof body === "object" &&
    body !== null &&
    !("participantToken" in body) &&
    request.headers.get("x-participant-token")
  ) {
    (body as Record<string, unknown>).participantToken =
      request.headers.get("x-participant-token");
  }

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { participantToken, text, parentId } = parsed.data;

  const participantHash = await resolveParticipantHash(
    session,
    participantToken ?? null,
  );

  if (!participantHash) {
    return NextResponse.json(
      { error: "Participant identification required" },
      { status: 401 }
    );
  }

  // Validate anonymous token if no session
  if (!session && participantToken) {
    const tokenError = validateParticipantToken(participantToken);
    if (tokenError) {
      return NextResponse.json({ error: tokenError }, { status: 400 });
    }
  }

  // If parentId given, verify parent comment exists and belongs to same idea
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, ideaId: true, parentId: true },
    });
    if (!parent || parent.ideaId !== id) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 400 }
      );
    }
    // Only allow one level of nesting
    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Nested replies are not allowed" },
        { status: 400 }
      );
    }
  }

  // Rate limit
  const rateLimit = checkRateLimit(
    `comment:${participantHash}`,
    RATE_LIMITS.comment
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Moderate comment text before persisting
  let moderationResult: { flagged: boolean; categories: string[] };
  try {
    moderationResult = await moderateText(text, callOpenAIModeration);
  } catch (error: unknown) {
    console.warn("comment-moderation-fail-open", {
      error: error instanceof Error ? error.message : String(error),
    });
    moderationResult = { flagged: false, categories: [] };
  }

  const commentStatus = moderationResult.flagged ? "FLAGGED" : "VISIBLE";

  const comment = await prisma.comment.create({
    data: {
      ideaId: id,
      participantHash,
      text,
      parentId: parentId ?? null,
      status: commentStatus,
    },
  });

  if (moderationResult.flagged) {
    await prisma.moderationEvent.create({
      data: {
        targetType: "COMMENT",
        targetId: comment.id,
        action: "AUTO_FLAG",
        reason: `auto_flag:${moderationResult.categories.join(",")}`,
        changedBy: "SYSTEM",
      },
    });

    return NextResponse.json(
      { ...comment, message: "Your comment is under review" },
      { status: 202 }
    );
  }

  return NextResponse.json(comment, { status: 201 });
}
