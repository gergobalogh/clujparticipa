import { describe, it, expect, afterAll, afterEach, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea } from "@/test/helpers/factories";
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

describe("GET /api/ideas", () => {
  beforeEach(async () => {
    await truncateAll(testPrisma);
  });

  afterEach(async () => {
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("returns paginated ideas", async () => {
    await createIdea(testPrisma, { title: "Idea 1" });
    await createIdea(testPrisma, { title: "Idea 2" });
    const req = new NextRequest("http://localhost:3000/api/ideas");
    const { GET } = await import("./route");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.ideas).toHaveLength(2);
  });

  it("filters by category", async () => {
    await createIdea(testPrisma, { category: "INFRASTRUCTURE" });
    await createIdea(testPrisma, { category: "EDUCATION" });
    const req = new NextRequest(
      "http://localhost:3000/api/ideas?category=INFRASTRUCTURE"
    );
    const { GET } = await import("./route");
    const res = await GET(req);
    const body = await res.json();
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].category).toBe("INFRASTRUCTURE");
  });

  it("filters by district", async () => {
    await createIdea(testPrisma, { district: "MANASTUR" });
    await createIdea(testPrisma, { district: "CENTRU" });
    const req = new NextRequest(
      "http://localhost:3000/api/ideas?district=MANASTUR"
    );
    const { GET } = await import("./route");
    const res = await GET(req);
    const body = await res.json();
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].district).toBe("MANASTUR");
  });

  it("filters by status", async () => {
    await createIdea(testPrisma, { status: "SUBMITTED" });
    await createIdea(testPrisma, { status: "COMPLETED" });
    const req = new NextRequest(
      "http://localhost:3000/api/ideas?status=SUBMITTED"
    );
    const { GET } = await import("./route");
    const res = await GET(req);
    const body = await res.json();
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].status).toBe("SUBMITTED");
  });

  it("excludes rejected ideas when showRejected=false", async () => {
    await createIdea(testPrisma, { status: "SUBMITTED" });
    await createIdea(testPrisma, { status: "REJECTED" });
    const req = new NextRequest(
      "http://localhost:3000/api/ideas?showRejected=false"
    );
    const { GET } = await import("./route");
    const res = await GET(req);
    const body = await res.json();
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].status).toBe("SUBMITTED");
  });

  it("returns 400 for invalid filter parameters", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/ideas?category=INVALID"
    );
    const { GET } = await import("./route");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/ideas", () => {
  beforeEach(async () => {
    await truncateAll(testPrisma);
  });

  afterEach(async () => {
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  const validBody = {
    title: "New Test Idea",
    description: "A description that is at least 10 chars",
    category: "INFRASTRUCTURE",
    district: "MANASTUR",
    latitude: 46.755,
    longitude: 23.557,
  };

  it("creates an idea with status SUBMITTED", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify(validBody),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe("SUBMITTED");
    expect(body.title).toBe("New Test Idea");
  });

  it("rejects invalid image URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        images: [{ url: "https://evil.com/image.jpg", mimeType: "image/jpeg", sizeBytes: 100, order: 0 }],
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects legacy local upload path as image URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        images: [{ url: "/uploads/ideas/abc123.jpg", mimeType: "image/jpeg", sizeBytes: 100, order: 0 }],
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects prefix-attack URL resembling Cloudflare domain", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        images: [{ url: "https://imagedelivery.net.evil.com/fake/image.jpg", mimeType: "image/jpeg", sizeBytes: 100, order: 0 }],
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("accepts valid Cloudflare image URLs", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        images: [{ url: "https://imagedelivery.net/test-account/some-id/public", mimeType: "image/jpeg", sizeBytes: 204800, order: 0 }],
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.images).toHaveLength(1);
    expect(body.images[0].url).toBe("https://imagedelivery.net/test-account/some-id/public");
  });

  it("rejects invalid image MIME type", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        images: [{ url: "https://imagedelivery.net/test/gif-image/public", mimeType: "image/gif", sizeBytes: 100, order: 0 }],
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects without participant identification (401)", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects missing required fields (400)", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({ title: "Too short" }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("stores notifyOnStatusChange and generates unsubscribeToken", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        notifyOnStatusChange: true,
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();

    const idea = await testPrisma.idea.findUnique({ where: { id: body.id } });
    expect(idea?.notifyOnStatusChange).toBe(true);
    expect(idea?.unsubscribeToken).not.toBeNull();
    expect(idea?.submitterParticipantHash).not.toBeNull();
  });

  it("does not expose submitterParticipantHash or unsubscribeToken in response", async () => {
    const req = new NextRequest("http://localhost:3000/api/ideas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-participant-token": TOKEN,
      },
      body: JSON.stringify({
        ...validBody,
        notifyOnStatusChange: true,
      }),
    });
    const { POST } = await import("./route");
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).not.toHaveProperty("submitterParticipantHash");
    expect(body).not.toHaveProperty("unsubscribeToken");
  });
});
