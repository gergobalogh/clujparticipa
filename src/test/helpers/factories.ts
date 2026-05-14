import type { PrismaClient } from "@prisma/client";

export async function createIdea(
  prisma: PrismaClient,
  overrides?: Partial<{
    title: string;
    description: string;
    category: string;
    district: string;
    latitude: number;
    longitude: number;
    status: string;
    submitterParticipantHash: string | null;
    notifyOnStatusChange: boolean;
    unsubscribeToken: string | null;
  }>
) {
  return prisma.idea.create({
    data: {
      title: overrides?.title ?? "Test Idea",
      description: overrides?.description ?? "A test idea description that is long enough",
      category: (overrides?.category ?? "INFRASTRUCTURE") as never,
      district: (overrides?.district ?? "MANASTUR") as never,
      latitude: overrides?.latitude ?? 46.755,
      longitude: overrides?.longitude ?? 23.557,
      status: (overrides?.status ?? "SUBMITTED") as never,
      submitterParticipantHash: overrides?.submitterParticipantHash ?? null,
      notifyOnStatusChange: overrides?.notifyOnStatusChange ?? false,
      unsubscribeToken: overrides?.unsubscribeToken ?? null,
    },
  });
}

export async function createComment(
  prisma: PrismaClient,
  ideaId: string,
  overrides?: Partial<{
    text: string;
    participantHash: string;
    parentId: string | null;
    status: string;
  }>
) {
  return prisma.comment.create({
    data: {
      ideaId,
      text: overrides?.text ?? "Test comment",
      participantHash: overrides?.participantHash ?? "hash-participant-0001",
      parentId: overrides?.parentId ?? null,
      status: (overrides?.status ?? "VISIBLE") as never,
    },
  });
}

export async function createVote(
  prisma: PrismaClient,
  ideaId: string,
  participantHash: string,
  overrides?: Partial<{
    notifyOnStatusChange: boolean;
    unsubscribeToken: string | null;
  }>
) {
  return prisma.vote.create({
    data: {
      ideaId,
      participantHash,
      direction: "SUPPORT",
      notifyOnStatusChange: overrides?.notifyOnStatusChange ?? false,
      unsubscribeToken: overrides?.unsubscribeToken ?? null,
    },
  });
}

export async function createBugReport(
  prisma: PrismaClient,
  overrides?: Partial<{
    description: string;
    pageUrl: string;
    contactEmail: string;
    participantHash: string | null;
  }>
) {
  return prisma.bugReport.create({
    data: {
      description: overrides?.description ?? "A bug report description that is long enough",
      pageUrl: overrides?.pageUrl ?? "https://example.com/page",
      contactEmail: overrides?.contactEmail ?? "test@example.com",
      participantHash: overrides?.participantHash ?? null,
    },
  });
}

export async function createFeasibilityNote(
  prisma: PrismaClient,
  ideaId: string,
  overrides?: Partial<{
    responseText: string;
    department: string | null;
    estimatedCostRonMin: number | null;
    estimatedCostRonMax: number | null;
  }>
) {
  return prisma.feasibilityNote.create({
    data: {
      ideaId,
      responseText: overrides?.responseText ?? "Official feasibility assessment.",
      department: overrides?.department ?? null,
      estimatedCostRonMin: overrides?.estimatedCostRonMin ?? null,
      estimatedCostRonMax: overrides?.estimatedCostRonMax ?? null,
      author: "admin",
    },
  });
}

export async function createVotingConfig(
  prisma: PrismaClient,
  overrides?: Partial<{
    startsAt: Date;
    endsAt: Date;
    label: string | null;
  }>
) {
  const now = new Date();
  return prisma.votingConfig.create({
    data: {
      id: "singleton",
      startsAt: overrides?.startsAt ?? new Date(now.getTime() - 86400000),
      endsAt: overrides?.endsAt ?? new Date(now.getTime() + 86400000),
      label: overrides?.label ?? null,
    },
  });
}

export async function createProgressUpdate(
  prisma: PrismaClient,
  ideaId: string,
  overrides?: Partial<{
    text: string;
    imageUrl: string | null;
  }>
) {
  return prisma.progressUpdate.create({
    data: {
      ideaId,
      text: overrides?.text ?? "Progress update text.",
      imageUrl: overrides?.imageUrl ?? null,
      author: "admin",
    },
  });
}
