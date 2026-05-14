import { describe, it, expect, afterEach, afterAll } from "vitest";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { GET } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

describe("GET /api/data-deletion-status", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("returns 400 when code is missing", async () => {
    const req = new NextRequest(
      new URL("http://localhost:3000/api/data-deletion-status"),
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown code", async () => {
    const req = new NextRequest(
      new URL(
        "http://localhost:3000/api/data-deletion-status?code=nonexistent",
      ),
    );
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("returns deletion request for valid code", async () => {
    const created = await testPrisma.dataDeletionRequest.create({
      data: {
        confirmationCode: "test-code-123",
        provider: "facebook",
        providerAccountId: "fb-user-1",
        status: "completed",
        completedAt: new Date(),
      },
    });

    const req = new NextRequest(
      new URL(
        `http://localhost:3000/api/data-deletion-status?code=${created.confirmationCode}`,
      ),
    );
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.confirmationCode).toBe("test-code-123");
    expect(body.status).toBe("completed");
    expect(body.completedAt).not.toBeNull();
  });
});
