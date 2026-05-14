import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
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

describe("POST /api/bug-reports", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function postBugReport(body: Record<string, unknown>, token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["x-participant-token"] = token;
    const req = new NextRequest("http://localhost:3000/api/bug-reports", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const { POST } = await import("./route");
    return POST(req);
  }

  it("creates a valid bug report", async () => {
    const res = await postBugReport(
      {
        description: "Something is broken on the page",
        pageUrl: "https://example.com/page",
        contactEmail: "test@example.com",
      },
      TOKEN
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  it("rejects description shorter than 10 chars (400)", async () => {
    const res = await postBugReport(
      {
        description: "Too short",
        contactEmail: "test@example.com",
      },
      TOKEN
    );
    expect(res.status).toBe(400);
  });

  it("rejects invalid email format (400)", async () => {
    const res = await postBugReport(
      {
        description: "A valid bug report description",
        contactEmail: "not-an-email",
      },
      TOKEN
    );
    expect(res.status).toBe(400);
  });
});
