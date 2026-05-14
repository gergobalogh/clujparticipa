import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createComment } from "@/test/helpers/factories";
import { _resetBuckets } from "@/lib/rate-limit";
import { mockAnonymousAuth } from "@/test/helpers/auth-mocks";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const authMocks = mockAnonymousAuth();
vi.mock("@/lib/auth-participant", () => ({
  getAuthSession: authMocks.getAuthSession,
  resolveParticipantHash: authMocks.resolveParticipantHash,
}));

const TOKEN = "anonymous-test-token-1234";

describe("POST /api/ideas/[id]/comments", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function postComment(
    id: string,
    body: { text: string; parentId?: string },
    token?: string
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["x-participant-token"] = token;
    const req = new NextRequest(
      `http://localhost:3000/api/ideas/${id}/comments`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );
    const { POST } = await import("./route");
    return POST(req, { params: Promise.resolve({ id }) });
  }

  it("creates a top-level comment", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postComment(idea.id, { text: "Great idea!" }, TOKEN);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.text).toBe("Great idea!");
    expect(body.parentId).toBeNull();
  });

  it("creates a reply to a top-level comment", async () => {
    const idea = await createIdea(testPrisma);
    const parent = await createComment(testPrisma, idea.id);
    const res = await postComment(
      idea.id,
      { text: "Reply text", parentId: parent.id },
      TOKEN
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.parentId).toBe(parent.id);
  });

  it("rejects reply to a reply (nested replies)", async () => {
    const idea = await createIdea(testPrisma);
    const parent = await createComment(testPrisma, idea.id);
    const reply = await createComment(testPrisma, idea.id, {
      parentId: parent.id,
    });
    const res = await postComment(
      idea.id,
      { text: "Reply to reply", parentId: reply.id },
      TOKEN
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Nested replies");
  });

  it("rejects reply to comment on different idea", async () => {
    const idea1 = await createIdea(testPrisma, { title: "Idea 1" });
    const idea2 = await createIdea(testPrisma, { title: "Idea 2" });
    const comment = await createComment(testPrisma, idea1.id);
    const res = await postComment(
      idea2.id,
      { text: "Wrong idea reply", parentId: comment.id },
      TOKEN
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Parent comment not found");
  });

  it("rejects without participant identification (401)", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postComment(idea.id, { text: "No auth comment" });
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await postComment("nonexistent-id", { text: "Ghost" }, TOKEN);
    expect(res.status).toBe(404);
  });

  it("returns 400 for empty text", async () => {
    const idea = await createIdea(testPrisma);
    const res = await postComment(idea.id, { text: "" }, TOKEN);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/ideas/[id]/comments", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function getComments(id: string) {
    const req = new NextRequest(
      `http://localhost:3000/api/ideas/${id}/comments`
    );
    const { GET } = await import("./route");
    return GET(req, { params: Promise.resolve({ id }) });
  }

  it("returns only VISIBLE top-level comments with nested replies", async () => {
    const idea = await createIdea(testPrisma);
    const parent = await createComment(testPrisma, idea.id, {
      text: "Parent",
    });
    await createComment(testPrisma, idea.id, {
      text: "Reply",
      parentId: parent.id,
    });
    const res = await getComments(idea.id);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0].text).toBe("Parent");
    expect(body.comments[0].replies).toHaveLength(1);
    expect(body.comments[0].replies[0].text).toBe("Reply");
  });

  it("excludes HIDDEN comments", async () => {
    const idea = await createIdea(testPrisma);
    await createComment(testPrisma, idea.id, {
      text: "Visible",
      status: "VISIBLE",
    });
    await createComment(testPrisma, idea.id, {
      text: "Hidden",
      status: "HIDDEN",
    });
    const res = await getComments(idea.id);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comments).toHaveLength(1);
    expect(body.comments[0].text).toBe("Visible");
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await getComments("nonexistent-id");
    expect(res.status).toBe(404);
  });
});
