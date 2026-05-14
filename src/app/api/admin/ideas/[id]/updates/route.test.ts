import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea } from "@/test/helpers/factories";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("POST /api/admin/ideas/[id]/updates", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function postUpdate(
    id: string,
    body: Record<string, unknown>,
    secret?: string
  ) {
    const req = new NextRequest(
      `http://localhost:3000/api/admin/ideas/${id}/updates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret ?? ADMIN_SECRET,
        },
        body: JSON.stringify(body),
      }
    );
    const { POST } = await import("./route");
    return POST(req, { params: Promise.resolve({ id }) });
  }

  it("creates a progress update", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {
      text: "Work has begun on the site survey.",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.text).toBe("Work has begun on the site survey.");
    expect(body.author).toBe("admin");
    expect(body.ideaId).toBe(idea.id);
  });

  it("creates a progress update with imageUrl", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {
      text: "Photo update.",
      imageUrl: "https://imagedelivery.net/test/progress-image/public",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.imageUrl).toBe("https://imagedelivery.net/test/progress-image/public");
  });

  it("returns 400 when text is missing", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {});
    expect(res.status).toBe(400);
  });

  it("returns 400 when text exceeds 5000 chars", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, { text: "x".repeat(5001) });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid imageUrl prefix", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {
      text: "Update.",
      imageUrl: "https://evil.com/image.jpg",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for legacy local upload path as imageUrl", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {
      text: "Update.",
      imageUrl: "/uploads/ideas/progress.jpg",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for prefix-attack URL resembling Cloudflare domain", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, {
      text: "Update.",
      imageUrl: "https://imagedelivery.net.evil.com/fake/image.jpg",
    });
    expect(res.status).toBe(400);
  });

  it("returns 401 without admin secret", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, { text: "Update." }, "");
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong admin secret", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postUpdate(idea.id, { text: "Update." }, "wrong-secret");
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await postUpdate("nonexistent-id", { text: "Update." });
    expect(res.status).toBe(404);
  });
});
