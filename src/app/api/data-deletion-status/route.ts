import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing confirmation code" },
      { status: 400 },
    );
  }

  const deletionRequest = await prisma.dataDeletionRequest.findUnique({
    where: { confirmationCode: code },
    select: {
      confirmationCode: true,
      status: true,
      completedAt: true,
      createdAt: true,
    },
  });

  if (!deletionRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(deletionRequest);
}
