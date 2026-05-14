import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createVote } from "@/test/helpers/factories";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

describe("GET /api/unsubscribe", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function unsubscribe(token: string) {
    const req = new NextRequest(
      `http://localhost:3000/api/unsubscribe?token=${token}`
    );
    const { GET } = await import("./route");
    return GET(req);
  }

  it("unsubscribes idea-level notification and clears token", async () => {
    const idea = await createIdea(testPrisma, {
      notifyOnStatusChange: true,
      unsubscribeToken: "idea-unsub-token-1",
    });

    const res = await unsubscribe("idea-unsub-token-1");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Dezabonare reușită");

    const updated = await testPrisma.idea.findUnique({ where: { id: idea.id } });
    expect(updated?.notifyOnStatusChange).toBe(false);
    expect(updated?.unsubscribeToken).toBeNull();
  });

  it("unsubscribes vote-level notification and clears token", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const vote = await createVote(testPrisma, idea.id, "hash-voter-001", {
      notifyOnStatusChange: true,
      unsubscribeToken: "vote-unsub-token-1",
    });

    const res = await unsubscribe("vote-unsub-token-1");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Dezabonare reușită");

    const updated = await testPrisma.vote.findUnique({ where: { id: vote.id } });
    expect(updated?.notifyOnStatusChange).toBe(false);
    expect(updated?.unsubscribeToken).toBeNull();
  });

  it("returns already-unsubscribed for unknown token", async () => {
    const res = await unsubscribe("nonexistent-token");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Deja dezabonat");
  });

  it("returns already-unsubscribed for empty token", async () => {
    const req = new NextRequest("http://localhost:3000/api/unsubscribe");
    const { GET } = await import("./route");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
