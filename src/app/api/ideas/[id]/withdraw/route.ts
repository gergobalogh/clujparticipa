import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveParticipantHash, getAuthSession } from "@/lib/auth-participant";
import { validateParticipantToken } from "@/lib/participant";
import { VOTE_ELIGIBLE_STATUSES } from "@/lib/transitions";

const WITHDRAW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAuthSession();

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

  const participantToken =
    typeof body === "object" && body !== null && "participantToken" in body
      ? (body as { participantToken?: string }).participantToken
      : undefined;

  const participantHash = await resolveParticipantHash(
    session,
    participantToken ?? null
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

  // Find the idea
  const idea = await prisma.idea.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      submitterParticipantHash: true,
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  // Verify the participant is the submitter
  if (idea.submitterParticipantHash !== participantHash) {
    return NextResponse.json(
      { error: "Only the idea submitter can withdraw" },
      { status: 403 }
    );
  }

  // Verify the idea is in a withdrawable status
  if (!VOTE_ELIGIBLE_STATUSES.includes(idea.status as (typeof VOTE_ELIGIBLE_STATUSES)[number])) {
    return NextResponse.json(
      { error: "Idea cannot be withdrawn in its current status" },
      { status: 403 }
    );
  }

  // Verify within 24h window
  const timeSinceCreation = Date.now() - idea.createdAt.getTime();
  if (timeSinceCreation > WITHDRAW_WINDOW_MS) {
    return NextResponse.json(
      { error: "Withdrawal is only allowed within 24 hours of submission" },
      { status: 403 }
    );
  }

  // Transition to WITHDRAWN
  const updated = await prisma.$transaction(async (tx) => {
    const updatedIdea = await tx.idea.update({
      where: { id },
      data: { status: "WITHDRAWN" },
    });

    await tx.statusChange.create({
      data: {
        ideaId: id,
        fromStatus: idea.status,
        toStatus: "WITHDRAWN",
        note: "Idea withdrawn by submitter",
        changedBy: `citizen:${participantHash.slice(0, 8)}`,
      },
    });

    await tx.moderationEvent.create({
      data: {
        targetType: "IDEA",
        targetId: id,
        action: "STATUS_CHANGE",
        reason: "Idea withdrawn by submitter within 24h window",
        changedBy: `citizen:${participantHash.slice(0, 8)}`,
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
