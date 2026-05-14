import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";
import { z } from "zod";

const feasibilitySchema = z.object({
  responseText: z.string().min(1).max(5000),
  department: z.string().optional(),
  estimatedCostRonMin: z.number().int().nonnegative().optional(),
  estimatedCostRonMax: z.number().int().nonnegative().optional(),
}).refine(
  (data) => {
    if (
      data.estimatedCostRonMin !== undefined &&
      data.estimatedCostRonMax !== undefined
    ) {
      return data.estimatedCostRonMin <= data.estimatedCostRonMax;
    }
    return true;
  },
  { message: "estimatedCostRonMin must be <= estimatedCostRonMax" }
);

export async function PUT(
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

  const parsed = feasibilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const note = await prisma.feasibilityNote.upsert({
    where: { ideaId: id },
    update: {
      responseText: parsed.data.responseText,
      department: parsed.data.department ?? null,
      estimatedCostRonMin: parsed.data.estimatedCostRonMin ?? null,
      estimatedCostRonMax: parsed.data.estimatedCostRonMax ?? null,
      author: "admin",
    },
    create: {
      ideaId: id,
      responseText: parsed.data.responseText,
      department: parsed.data.department ?? null,
      estimatedCostRonMin: parsed.data.estimatedCostRonMin ?? null,
      estimatedCostRonMax: parsed.data.estimatedCostRonMax ?? null,
      author: "admin",
    },
  });

  return NextResponse.json(note);
}
