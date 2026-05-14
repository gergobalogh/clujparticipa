import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return htmlResponse("Missing token.", 400);
  }

  // Check Idea.unsubscribeToken
  const idea = await prisma.idea.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true },
  });

  if (idea) {
    await prisma.idea.update({
      where: { id: idea.id },
      data: { notifyOnStatusChange: false, unsubscribeToken: null },
    });
    return htmlResponse(
      `<h1>Dezabonare reușită</h1><p>Nu veți mai primi actualizări pentru această idee.</p><p><a href="${APP_URL}/ro/ideas/${idea.id}">Înapoi la idee</a></p>`
    );
  }

  // Check Vote.unsubscribeToken
  const vote = await prisma.vote.findFirst({
    where: { unsubscribeToken: token },
    select: { id: true, ideaId: true },
  });

  if (vote) {
    await prisma.vote.update({
      where: { id: vote.id },
      data: { notifyOnStatusChange: false, unsubscribeToken: null },
    });
    return htmlResponse(
      `<h1>Dezabonare reușită</h1><p>Nu veți mai primi actualizări pentru această idee.</p><p><a href="${APP_URL}/ro/ideas/${vote.ideaId}">Înapoi la idee</a></p>`
    );
  }

  return htmlResponse(
    `<h1>Deja dezabonat</h1><p>Deja dezabonat sau link-ul a expirat.</p>`
  );
}

function htmlResponse(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dezabonare</title><style>body{font-family:system-ui,sans-serif;max-width:480px;margin:2rem auto;padding:0 1rem;color:#334155}h1{color:#0f172a}a{color:#1d4ed8}</style></head><body>${body}</body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}
