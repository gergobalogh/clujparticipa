import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.votingConfig.findFirst();

  if (!config) {
    return NextResponse.json({ config: null });
  }

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
