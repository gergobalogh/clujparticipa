import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { testPrisma } = vi.hoisted(() => ({
  testPrisma: {
    idea: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

import { GET } from "@/app/api/og/ideas/[id]/route";

describe("OG Image Route /api/og/ideas/[id]", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a 200 PNG image for an existing idea", async () => {
    testPrisma.idea.findUnique.mockResolvedValue({
      id: "idea-1",
      title: "New bike lane on Dorobantilor",
      category: "TRANSPORT",
      description: "A dedicated bike lane",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const req = new NextRequest("http://localhost:3000/api/og/ideas/idea-1");
    const res = await GET(req, { params: Promise.resolve({ id: "idea-1" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  // Deferred to step 01-05: category color background
  // Deferred to step 01-05: 404 for non-existent idea
  // Deferred to step 01-05: long title truncation
  // Deferred to step 01-05: 500 on Prisma error
});
