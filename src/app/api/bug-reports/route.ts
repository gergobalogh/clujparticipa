import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateParticipantToken } from "@/lib/participant";
import { getAuthSession, resolveParticipantHash } from "@/lib/auth-participant";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { z } from "zod";

const createBugReportSchema = z.object({
  description: z.string().min(10).max(5000),
  pageUrl: z.string().max(500).optional(),
  contactEmail: z.string().email().max(254).optional(),
  participantToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getAuthSession();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body === "object" &&
    body !== null &&
    !("participantToken" in body) &&
    request.headers.get("x-participant-token")
  ) {
    (body as Record<string, unknown>).participantToken =
      request.headers.get("x-participant-token");
  }

  const parsed = createBugReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { participantToken, ...reportData } = parsed.data;

  const participantHash = await resolveParticipantHash(
    session,
    participantToken ?? null
  );

  if (!session && participantToken) {
    const tokenError = validateParticipantToken(participantToken);
    if (tokenError) {
      return NextResponse.json({ error: tokenError }, { status: 400 });
    }
  }

  const rateLimitKey = `bug-report:create:${
    participantHash ||
    request.headers.get("x-forwarded-for") ||
    "anonymous"
  }`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.bugReport);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", resetAt: rateLimit.resetAt },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  const bugReport = await prisma.bugReport.create({
    data: {
      description: reportData.description,
      pageUrl: reportData.pageUrl ?? null,
      contactEmail: reportData.contactEmail ?? null,
      participantHash,
    },
  });

  return NextResponse.json({ id: bugReport.id }, { status: 201 });
}
