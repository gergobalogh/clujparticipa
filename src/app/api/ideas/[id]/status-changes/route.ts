import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const statusChanges = await prisma.statusChange.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ statusChanges });
}
