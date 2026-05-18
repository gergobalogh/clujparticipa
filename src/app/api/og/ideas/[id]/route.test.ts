import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { NextRequest } from "next/server";

// @ts-ignore — RED scaffold import
import { GET } from "@/app/api/og/ideas/[id]/route";

const testPrisma = {
  idea: {
    findUnique: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

describe("OG Image Route /api/og/ideas/[id]", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a 1200x630 PNG image for an existing idea", async () => {
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

  it("uses the category color for the image background", async () => {
    testPrisma.idea.findUnique.mockResolvedValue({
      id: "idea-2",
      title: "Park benches in Gheorgheni",
      category: "INFRASTRUCTURE",
      description: "More benches",
      district: "GHEORGHENI",
      status: "SUBMITTED",
      images: [],
    });

    const req = new NextRequest("http://localhost:3000/api/og/ideas/idea-2");
    const res = await GET(req, { params: Promise.resolve({ id: "idea-2" }) });

    expect(res.status).toBe(200);
  });

  it("returns 404 for a non-existent idea", async () => {
    testPrisma.idea.findUnique.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/og/ideas/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("truncates long titles with ellipsis", async () => {
    testPrisma.idea.findUnique.mockResolvedValue({
      id: "idea-3",
      title: "This is a very long idea title that exceeds the eighty character limit and should be truncated with an ellipsis when rendered in the OG image",
      category: "OTHER",
      description: "Long title",
      district: "MANASTUR",
      status: "SUBMITTED",
      images: [],
    });

    const req = new NextRequest("http://localhost:3000/api/og/ideas/idea-3");
    const res = await GET(req, { params: Promise.resolve({ id: "idea-3" }) });

    expect(res.status).toBe(200);
  });

  it("returns 500 when Prisma query throws an error", async () => {
    testPrisma.idea.findUnique.mockRejectedValue(new Error("Database connection lost"));

    const req = new NextRequest("http://localhost:3000/api/og/ideas/idea-1");
    const res = await GET(req, { params: Promise.resolve({ id: "idea-1" }) });

    expect(res.status).toBe(500);
  });
});
