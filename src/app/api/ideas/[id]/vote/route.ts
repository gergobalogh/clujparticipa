import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { VOTE_ELIGIBLE_STATUSES } from "@/lib/transitions";
import { z } from "zod";

const voteSchema = z.object({
  participantToken: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAuthSession();

  // Verify idea exists and is open for voting/support
  const idea = await prisma.idea.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }
  if (!VOTE_ELIGIBLE_STATUSES.includes(idea.status)) {
    return NextResponse.json({ error: "Idea is not open for voting" }, { status: 403 });
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

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const participantHash = await resolveParticipantHash(
    session,
    parsed.data.participantToken ?? null,
  );

  if (!participantHash) {
    return NextResponse.json(
      { error: "Participant identification required" },
      { status: 401 }
    );
  }

  // Validate anonymous token if no session
  if (!session && parsed.data.participantToken) {
    const tokenError = validateParticipantToken(parsed.data.participantToken);
    if (tokenError) {
      return NextResponse.json({ error: tokenError }, { status: 400 });
    }
  }

  // Rate limit
  const rateLimit = checkRateLimit(
    `vote:${participantHash}`,
    RATE_LIMITS.vote
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Duplicate vote check — one vote per participant per idea
  const existing = await prisma.vote.findUnique({
    where: {
      ideaId_participantHash: { ideaId: id, participantHash },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already voted", existingVote: { direction: existing.direction } },
      { status: 409 }
    );
  }

  const vote = await prisma.vote.create({
    data: {
      ideaId: id,
      participantHash,
      direction: "SUPPORT",
    },
  });

  const supportCount = await prisma.vote.count({
    where: { ideaId: id, direction: "SUPPORT" },
  });

  return NextResponse.json(
    { vote: { direction: vote.direction, createdAt: vote.createdAt }, supportCount },
    { status: 201 }
  );
}
