import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminAuth } from "@/lib/admin-auth";
import { CLOUDFLARE_IMAGE_BASE } from "@/lib/image-validation";
import { z } from "zod";

const updateSchema = z.object({
  text: z.string().min(1).max(5000),
  imageUrl: z.string().optional(),
}).refine(
  (data) => {
    if (data.imageUrl && !data.imageUrl.startsWith(CLOUDFLARE_IMAGE_BASE)) {
      return false;
    }
    return true;
  },
  { message: "imageUrl must be a Cloudflare Images delivery URL" }
);

export async function POST(
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const update = await prisma.progressUpdate.create({
    data: {
      ideaId: id,
      text: parsed.data.text,
      imageUrl: parsed.data.imageUrl ?? null,
      author: "admin",
    },
  });

  return NextResponse.json(update, { status: 201 });
}
