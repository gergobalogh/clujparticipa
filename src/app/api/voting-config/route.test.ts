import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createVotingConfig } from "@/test/helpers/factories";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("GET /api/voting-config", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("returns null when no config is set", async () => {
    const req = new NextRequest("http://localhost:3000/api/voting-config");
    const { GET } = await import("./route");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config).toBeNull();
  });

  it("returns config with isOpen when set", async () => {
    await createVotingConfig(testPrisma);
    const req = new NextRequest("http://localhost:3000/api/voting-config");
    const { GET } = await import("./route");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config).not.toBeNull();
    expect(body.config.isOpen).toBe(true);
  });

  it("returns isOpen=false when voting period has ended", async () => {
    await createVotingConfig(testPrisma, {
      startsAt: new Date("2020-01-01"),
      endsAt: new Date("2020-01-02"),
    });
    const req = new NextRequest("http://localhost:3000/api/voting-config");
    const { GET } = await import("./route");
    const res = await GET(req);
    const body = await res.json();
    expect(body.config.isOpen).toBe(false);
  });
});

describe("PUT /api/admin/voting-config", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function putConfig(body: Record<string, unknown>, secret?: string) {
    const req = new NextRequest(
      "http://localhost:3000/api/admin/voting-config",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret ?? ADMIN_SECRET,
        },
        body: JSON.stringify(body),
      }
    );
    const { PUT } = await import(
      "@/app/api/admin/voting-config/route"
    );
    return PUT(req);
  }

  it("creates a voting config", async () => {
    const startsAt = new Date("2026-06-01T00:00:00Z").toISOString();
    const endsAt = new Date("2026-06-30T00:00:00Z").toISOString();
    const res = await putConfig({ startsAt, endsAt, label: "June 2026" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config.label).toBe("June 2026");
  });

  it("updates existing voting config (upsert)", async () => {
    await createVotingConfig(testPrisma);
    const startsAt = new Date("2026-07-01T00:00:00Z").toISOString();
    const endsAt = new Date("2026-07-31T00:00:00Z").toISOString();
    const res = await putConfig({ startsAt, endsAt, label: "July 2026" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config.label).toBe("July 2026");

    const configs = await testPrisma.votingConfig.findMany();
    expect(configs).toHaveLength(1);
  });

  it("returns 400 when endsAt is before startsAt", async () => {
    const startsAt = new Date("2026-07-01T00:00:00Z").toISOString();
    const endsAt = new Date("2026-06-01T00:00:00Z").toISOString();
    const res = await putConfig({ startsAt, endsAt });
    expect(res.status).toBe(400);
  });

  it("returns 401 without admin secret", async () => {
    const startsAt = new Date("2026-06-01T00:00:00Z").toISOString();
    const endsAt = new Date("2026-06-30T00:00:00Z").toISOString();
    const res = await putConfig({ startsAt, endsAt }, "");
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong admin secret", async () => {
    const startsAt = new Date("2026-06-01T00:00:00Z").toISOString();
    const endsAt = new Date("2026-06-30T00:00:00Z").toISOString();
    const res = await putConfig({ startsAt, endsAt }, "wrong-secret");
    expect(res.status).toBe(401);
  });
});
