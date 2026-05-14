import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createVote, createComment } from "@/test/helpers/factories";
import { _resetBuckets } from "@/lib/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

describe("GET /api/stats", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("returns zeros for empty database", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalIdeas).toBe(0);
    expect(body.totalVotes).toBe(0);
    expect(body.totalComments).toBe(0);
    expect(body.recentIdeas).toHaveLength(0);
  });

  it("returns aggregate counts", async () => {
    const idea1 = await createIdea(testPrisma, { title: "Idea 1" });
    await createIdea(testPrisma, { title: "Idea 2" });
    await createVote(testPrisma, idea1.id, "hash-voter-1");
    await createVote(testPrisma, idea1.id, "hash-voter-2");
    await createComment(testPrisma, idea1.id, { text: "Comment" });

    const { GET } = await import("./route");
    const res = await GET();
    const body = await res.json();
    expect(body.totalIdeas).toBe(2);
    expect(body.totalVotes).toBe(2);
    expect(body.totalComments).toBe(1);
    expect(body.recentIdeas.length).toBeLessThanOrEqual(5);
    expect(body.statusCounts).toBeDefined();
  });
});
