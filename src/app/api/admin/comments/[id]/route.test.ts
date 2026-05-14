import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createComment } from "@/test/helpers/factories";
import { _resetBuckets } from "@/lib/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("PATCH /api/admin/comments/[id]", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function moderateComment(
    id: string,
    body: { status: string; reason: string },
    secret?: string
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-admin-secret": secret ?? ADMIN_SECRET,
    };
    const req = new NextRequest(
      `http://localhost:3000/api/admin/comments/${id}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }
    );
    const { PATCH } = await import("./route");
    return PATCH(req, { params: Promise.resolve({ id }) });
  }

  it("hides a VISIBLE comment", async () => {
    const idea = await createIdea(testPrisma);
    const comment = await createComment(testPrisma, idea.id, {
      status: "VISIBLE",
    });
    const res = await moderateComment(comment.id, {
      status: "HIDDEN",
      reason: "Inappropriate content",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("HIDDEN");

    const modEvents = await testPrisma.moderationEvent.findMany({
      where: { targetId: comment.id, targetType: "COMMENT" },
    });
    expect(modEvents).toHaveLength(1);
    expect(modEvents[0].action).toBe("HIDE");
  });

  it("restores a HIDDEN comment", async () => {
    const idea = await createIdea(testPrisma);
    const comment = await createComment(testPrisma, idea.id, {
      status: "HIDDEN",
    });
    const res = await moderateComment(comment.id, {
      status: "VISIBLE",
      reason: "Restored after review",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("VISIBLE");

    const modEvents = await testPrisma.moderationEvent.findMany({
      where: { targetId: comment.id, targetType: "COMMENT" },
    });
    expect(modEvents).toHaveLength(1);
    expect(modEvents[0].action).toBe("RESTORE");
  });

  it("returns 409 when setting same status", async () => {
    const idea = await createIdea(testPrisma);
    const comment = await createComment(testPrisma, idea.id, {
      status: "VISIBLE",
    });
    const res = await moderateComment(comment.id, {
      status: "VISIBLE",
      reason: "Already visible",
    });
    expect(res.status).toBe(409);
  });

  it("returns 401 without admin secret", async () => {
    const idea = await createIdea(testPrisma);
    const comment = await createComment(testPrisma, idea.id);
    const res = await moderateComment(comment.id, {
      status: "HIDDEN",
      reason: "No auth",
    }, "");
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent comment", async () => {
    const res = await moderateComment("nonexistent-id", {
      status: "HIDDEN",
      reason: "Not found",
    });
    expect(res.status).toBe(404);
  });
});
