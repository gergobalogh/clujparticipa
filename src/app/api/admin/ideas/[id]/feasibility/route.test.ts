import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createFeasibilityNote } from "@/test/helpers/factories";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("PUT /api/admin/ideas/[id]/feasibility", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function putFeasibility(
    id: string,
    body: Record<string, unknown>,
    secret?: string
  ) {
    const req = new NextRequest(
      `http://localhost:3000/api/admin/ideas/${id}/feasibility`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret ?? ADMIN_SECRET,
        },
        body: JSON.stringify(body),
      }
    );
    const { PUT } = await import("./route");
    return PUT(req, { params: Promise.resolve({ id }) });
  }

  it("creates a feasibility note", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {
      responseText: "This idea is feasible.",
      department: "Infrastructure Dept",
      estimatedCostRonMin: 100000,
      estimatedCostRonMax: 500000,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.responseText).toBe("This idea is feasible.");
    expect(body.department).toBe("Infrastructure Dept");
    expect(body.estimatedCostRonMin).toBe(100000);
    expect(body.estimatedCostRonMax).toBe(500000);
    expect(body.author).toBe("admin");
  });

  it("updates an existing feasibility note (upsert)", async () => {
    const idea = await createIdea(testPrisma);
    await createFeasibilityNote(testPrisma, idea.id, {
      responseText: "Initial assessment.",
    });

    const res = await putFeasibility(idea.id, {
      responseText: "Updated assessment.",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.responseText).toBe("Updated assessment.");

    const notes = await testPrisma.feasibilityNote.findMany({
      where: { ideaId: idea.id },
    });
    expect(notes).toHaveLength(1);
  });

  it("returns 400 when responseText is missing", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {});
    expect(res.status).toBe(400);
  });

  it("returns 400 when responseText exceeds 5000 chars", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {
      responseText: "x".repeat(5001),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when cost min > cost max", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {
      responseText: "Assessment.",
      estimatedCostRonMin: 500000,
      estimatedCostRonMax: 100000,
    });
    expect(res.status).toBe(400);
  });

  it("returns 401 without admin secret", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {
      responseText: "Assessment.",
    }, "");
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong admin secret", async () => {
    const idea = await createIdea(testPrisma);
    const res = await putFeasibility(idea.id, {
      responseText: "Assessment.",
    }, "wrong-secret");
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await putFeasibility("nonexistent-id", {
      responseText: "Assessment.",
    });
    expect(res.status).toBe(404);
  });
});
