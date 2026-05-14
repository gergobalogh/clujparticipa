import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

const SINGLETON_ID = "singleton";

const configSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  label: z.string().optional(),
}).refine(
  (data) => new Date(data.startsAt) < new Date(data.endsAt),
  { message: "endsAt must be after startsAt" }
);

export async function PUT(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.status }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);

  const config = await prisma.votingConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {
      startsAt,
      endsAt,
      label: parsed.data.label ?? null,
    },
    create: {
      id: SINGLETON_ID,
      startsAt,
      endsAt,
      label: parsed.data.label ?? null,
    },
  });

  const now = new Date();
  const isOpen = now >= config.startsAt && now <= config.endsAt;

  return NextResponse.json({
    config: {
      startsAt: config.startsAt,
      endsAt: config.endsAt,
      label: config.label,
      isOpen,
    },
  });
}
