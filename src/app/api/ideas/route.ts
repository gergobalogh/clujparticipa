import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { isAllowedMimeType, CLOUDFLARE_IMAGE_BASE } from "@/lib/image-validation";
import { Prisma, Status } from "@prisma/client";
import { z } from "zod";

// ── GET /api/ideas ── list with filters, sorting, pagination ──

const listParamsSchema = z.object({
  category: z.enum([
    "INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE",
    "SAFETY", "TRANSPORT", "HEALTH", "OTHER",
  ]).optional(),
  district: z.enum([
    "MANASTUR", "GHEORGHENI", "ZORILOR", "CENTRU", "MARASTI",
    "GRIGORESCU", "IRIS", "GRUIA", "ANDREI_MURESANU", "BUNA_ZIUA",
    "BORHANCI", "DAMBU_ROTUND", "OTHER",
  ]).optional(),
  status: z.enum([
    "SUBMITTED", "IN_VOTING", "SELECTED", "ACCEPTED",
    "IN_PROGRESS", "COMPLETED", "REJECTED", "NEEDS_REVISION",
    "MERGED", "WITHDRAWN",
  ]).optional(),
  sort: z.enum(["date", "votes"]).default("date"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  showRejected: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = listParamsSchema.safeParse(
    Object.fromEntries(searchParams.entries())
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filter parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { category, district, status, sort, page, limit, showRejected } = parsed.data;
  const terminalStatuses: Status[] = ["REJECTED", "NEEDS_REVISION", "MERGED", "WITHDRAWN"];
  const where: Prisma.IdeaWhereInput = {};
  if (category) where.category = category;
  if (district) where.district = district;
  if (status) where.status = status;
  if (!showRejected && !status) where.status = { notIn: terminalStatuses };

  const skip = (page - 1) * limit;

  // Sort terminal-status ideas to the bottom
  const activeWhere: Prisma.IdeaWhereInput = status
    ? where
    : { ...where, status: { notIn: terminalStatuses } };
  const terminalWhere: Prisma.IdeaWhereInput = { ...where, status: { in: terminalStatuses } };

  const effectiveOrderBy = sort === "votes"
    ? { votes: { _count: "desc" as const } }
    : { createdAt: "desc" as const };

  const includeArgs = {
    _count: { select: { votes: true, comments: true, images: true } },
    statusChanges: {
      where: { toStatus: { in: terminalStatuses } },
      select: { note: true },
      orderBy: { createdAt: "desc" as const },
      take: 1,
    },
    images: {
      where: { order: 0 },
      select: { url: true, alt: true, width: true, height: true },
      take: 1,
    },
  };

  if (status || !showRejected) {
    const isTerminalFilter = status && terminalStatuses.includes(status as Status);
    const singleWhere = isTerminalFilter ? terminalWhere : (showRejected ? where : activeWhere);
    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where: singleWhere,
        include: includeArgs,
        orderBy: effectiveOrderBy,
        skip,
        take: limit,
      }),
      prisma.idea.count({ where: singleWhere }),
    ]);

    return NextResponse.json({
      ideas: ideas.map((idea) => ({
        ...idea,
        firstImage: idea.images[0] || null,
        rejectionNote: idea.statusChanges[0]?.note ?? null,
        _count: idea._count,
        images: undefined,
        statusChanges: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  const [active, activeTotal, terminal] = await Promise.all([
    prisma.idea.findMany({
      where: activeWhere,
      include: includeArgs,
      orderBy: effectiveOrderBy,
    }),
    prisma.idea.count({ where: activeWhere }),
    prisma.idea.findMany({
      where: terminalWhere,
      include: includeArgs,
      orderBy: effectiveOrderBy,
    }),
  ]);

  const allIdeas = [...active, ...terminal];
  const total = activeTotal + terminal.length;
  const paginatedIdeas = allIdeas.slice(skip, skip + limit);

  return NextResponse.json({
    ideas: paginatedIdeas.map((idea) => ({
      ...idea,
      firstImage: idea.images[0] || null,
      rejectionNote: idea.statusChanges[0]?.note ?? null,
      _count: idea._count,
      images: undefined,
      statusChanges: undefined,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// ── POST /api/ideas ── create ──

const createIdeaSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum([
    "INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE",
    "SAFETY", "TRANSPORT", "HEALTH", "OTHER",
  ]),
  district: z.enum([
    "MANASTUR", "GHEORGHENI", "ZORILOR", "CENTRU", "MARASTI",
    "GRIGORESCU", "IRIS", "GRUIA", "ANDREI_MURESANU", "BUNA_ZIUA",
    "BORHANCI", "DAMBU_ROTUND", "OTHER",
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  participantToken: z.string().optional(),
  notifyOnStatusChange: z.boolean().optional().default(false),
  images: z.array(z.object({
    url: z.string(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    mimeType: z.string(),
    sizeBytes: z.number(),
    order: z.number(),
  })).max(5).optional(),
});

export async function POST(request: NextRequest) {
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

  const parsed = createIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { participantToken, images, notifyOnStatusChange, ...ideaData } = parsed.data;

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

  // Rate limit by participant hash
  const rateLimit = checkRateLimit(
    `idea:create:${participantHash}`,
    RATE_LIMITS.create
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Validate that image URLs point to Cloudflare Images
  if (images && images.length > 0) {
    for (const img of images) {
      if (!img.url.startsWith(CLOUDFLARE_IMAGE_BASE)) {
        return NextResponse.json(
          { error: `Invalid image URL: ${img.url}` },
          { status: 400 }
        );
      }
      if (!isAllowedMimeType(img.mimeType)) {
        return NextResponse.json(
          { error: `Invalid image MIME type: ${img.mimeType}` },
          { status: 400 }
        );
      }
    }
  }

  const idea = await prisma.idea.create({
    data: {
      ...ideaData,
      status: "SUBMITTED",
      submitterParticipantHash: participantHash,
      notifyOnStatusChange,
      unsubscribeToken: notifyOnStatusChange ? crypto.randomUUID() : null,
      images: images?.length
        ? {
            create: images.map((img) => ({
              url: img.url,
              alt: ideaData.title,
              width: img.width ?? null,
              height: img.height ?? null,
              mimeType: img.mimeType,
              sizeBytes: img.sizeBytes,
              order: img.order,
            })),
          }
        : undefined,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  const { submitterParticipantHash: _submitterHash, unsubscribeToken: _unsubToken, ...safeIdea } = idea;
  return NextResponse.json(safeIdea, { status: 201 });
}
