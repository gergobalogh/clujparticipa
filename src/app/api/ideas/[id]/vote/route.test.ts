import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createVotingConfig } from "@/test/helpers/factories";
import { mockAnonymousAuth } from "@/test/helpers/auth-mocks";
import { _resetBuckets } from "@/lib/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const authMocks = mockAnonymousAuth();
vi.mock("@/lib/auth-participant", () => ({
  getAuthSession: authMocks.getAuthSession,
  resolveParticipantHash: authMocks.resolveParticipantHash,
}));

const TOKEN = "anonymous-test-token-1234";

let ideaId: string;

describe("POST /api/ideas/[id]/vote", () => {
  beforeAll(async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    ideaId = idea.id;
  });

  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    ideaId = idea.id;
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function vote(ideaId: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers["x-participant-token"] = token;
    const req = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}/vote`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    const { POST } = await import("./route");
    return POST(req, { params: Promise.resolve({ id: ideaId }) });
  }

  it("allows vote on SUBMITTED idea", async () => {
    const res = await vote(ideaId, TOKEN);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.vote.direction).toBe("SUPPORT");
    expect(body.supportCount).toBe(1);
  });

  it("allows vote on IN_VOTING idea", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "IN_VOTING" });
    const res = await vote(idea.id, TOKEN);
    expect(res.status).toBe(201);
  });

  it("rejects vote on SELECTED idea (403)", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "SELECTED" });
    const res = await vote(idea.id, TOKEN);
    expect(res.status).toBe(403);
  });

  it("rejects vote on COMPLETED idea (403)", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "COMPLETED" });
    const res = await vote(idea.id, TOKEN);
    expect(res.status).toBe(403);
  });

  it("rejects vote on REJECTED idea (403)", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "REJECTED" });
    const res = await vote(idea.id, TOKEN);
    expect(res.status).toBe(403);
  });

  it("prevents duplicate vote (409)", async () => {
    await vote(ideaId, TOKEN);
    const res = await vote(ideaId, TOKEN);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("Already voted");
  });

  it("allows different participants to vote on same idea", async () => {
    await vote(ideaId, TOKEN);
    const res = await vote(ideaId, "another-participant-token-5678");
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.supportCount).toBe(2);
  });

  it("rejects without participant identification (401)", async () => {
    const res = await vote(ideaId);
    expect(res.status).toBe(401);
  });

  it("rejects short token (400)", async () => {
    const req = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}/vote`, {
      method: "POST",
      headers: { "x-participant-token": "short" },
      body: JSON.stringify({}),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: ideaId }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await vote("nonexistent-id", TOKEN);
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: "not-json",
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: ideaId }) });
    expect(res.status).toBe(400);
  });

  it("stores notifyOnStatusChange=true and generates unsubscribeToken", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const req = new NextRequest(`http://localhost:3000/api/ideas/${idea.id}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: JSON.stringify({ notifyOnStatusChange: true }),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: idea.id }) });
    expect(res.status).toBe(201);

    const vote = await testPrisma.vote.findFirst({ where: { ideaId: idea.id } });
    expect(vote?.notifyOnStatusChange).toBe(true);
    expect(vote?.unsubscribeToken).not.toBeNull();
  });

  it("stores notifyOnStatusChange=false with no unsubscribeToken", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const req = new NextRequest(`http://localhost:3000/api/ideas/${idea.id}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: JSON.stringify({ notifyOnStatusChange: false }),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: idea.id }) });
    expect(res.status).toBe(201);

    const vote = await testPrisma.vote.findFirst({ where: { ideaId: idea.id } });
    expect(vote?.notifyOnStatusChange).toBe(false);
    expect(vote?.unsubscribeToken).toBeNull();
  });

  it("rejects vote outside voting window (403)", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    await createVotingConfig(testPrisma, {
      startsAt: new Date("2020-01-01"),
      endsAt: new Date("2020-01-02"),
    });
    const idea = await createIdea(testPrisma, { status: "IN_VOTING" });
    const req = new NextRequest(`http://localhost:3000/api/ideas/${idea.id}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: JSON.stringify({}),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: idea.id }) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("not currently open");
  });

  it("allows vote inside voting window", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    await createVotingConfig(testPrisma);
    const idea = await createIdea(testPrisma, { status: "IN_VOTING" });
    const req = new NextRequest(`http://localhost:3000/api/ideas/${idea.id}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: JSON.stringify({}),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: idea.id }) });
    expect(res.status).toBe(201);
  });

  it("allows vote when no voting config is set", async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    const idea = await createIdea(testPrisma, { status: "IN_VOTING" });
    const req = new NextRequest(`http://localhost:3000/api/ideas/${idea.id}/vote`, {
      method: "POST",
      headers: { "x-participant-token": TOKEN },
      body: JSON.stringify({}),
    });
    const { POST } = await import("./route");
    const res = await POST(req, { params: Promise.resolve({ id: idea.id }) });
    expect(res.status).toBe(201);
  });
});
