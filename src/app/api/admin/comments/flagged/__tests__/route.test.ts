import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createComment } from "@/test/helpers/factories";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("GET /api/admin/comments/flagged", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function fetchFlagged(secret?: string) {
    const headers: Record<string, string> = {
      "x-admin-secret": secret ?? ADMIN_SECRET,
    };
    const req = new NextRequest(
      "http://localhost:3000/api/admin/comments/flagged",
      { headers }
    );
    const { GET } = await import("../route");
    return GET(req);
  }

  it("returns only FLAGGED comments with idea title and parsed categories", async () => {
    const idea = await createIdea(testPrisma, { title: "Fix the park" });
    const flagged = await createComment(testPrisma, idea.id, {
      text: "Offensive content",
      status: "FLAGGED",
    });
    await createComment(testPrisma, idea.id, {
      text: "Normal comment",
      status: "VISIBLE",
    });

    await testPrisma.moderationEvent.create({
      data: {
        targetType: "COMMENT",
        targetId: flagged.id,
        action: "AUTO_FLAG",
        reason: "auto_flag:hate,harassment",
        changedBy: "system",
      },
    });

    const res = await fetchFlagged();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0].id).toBe(flagged.id);
    expect(body.comments[0].ideaTitle).toBe("Fix the park");
    expect(body.comments[0].flaggedCategories).toEqual([
      "hate",
      "harassment",
    ]);
  });

  it("returns 401 without admin secret", async () => {
    const res = await fetchFlagged("");
    expect(res.status).toBe(401);
  });

  it("returns empty list when no flagged comments exist", async () => {
    const idea = await createIdea(testPrisma);
    await createComment(testPrisma, idea.id, { status: "VISIBLE" });

    const res = await fetchFlagged();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(0);
    expect(body.comments).toHaveLength(0);
  });

  it("handles comments without auto_flag reason gracefully", async () => {
    const idea = await createIdea(testPrisma);
    const flagged = await createComment(testPrisma, idea.id, {
      status: "FLAGGED",
    });

    const res = await fetchFlagged();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0].id).toBe(flagged.id);
    expect(body.comments[0].flaggedCategories).toEqual([]);
  });
});
