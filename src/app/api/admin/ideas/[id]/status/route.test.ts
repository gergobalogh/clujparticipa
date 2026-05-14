import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea } from "@/test/helpers/factories";
import { _resetBuckets } from "@/lib/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

vi.mock("@/lib/email", () => ({
  sendStatusChangeEmails: vi.fn().mockResolvedValue({ sent: 0 }),
}));

const ADMIN_SECRET = "test-admin-secret-12345";

describe("PATCH /api/admin/ideas/[id]/status", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  async function changeStatus(
    id: string,
    body: { status: string; note: string; force?: boolean },
    secret?: string | null
  ) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret !== null) {
      headers["x-admin-secret"] = secret ?? ADMIN_SECRET;
    }
    const req = new NextRequest(
      `http://localhost:3000/api/admin/ideas/${id}/status`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }
    );
    const { PATCH } = await import("./route");
    return PATCH(req, { params: Promise.resolve({ id }) });
  }

  it("allows valid transition SUBMITTED→UNDER_REVIEW", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "UNDER_REVIEW",
      note: "Starting review",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("UNDER_REVIEW");
  });

  it("allows REJECTED→UNDER_REVIEW (reopening)", async () => {
    const idea = await createIdea(testPrisma, { status: "REJECTED" });
    const res = await changeStatus(idea.id, {
      status: "UNDER_REVIEW",
      note: "Reopening",
    });
    expect(res.status).toBe(200);
  });

  it("rejects invalid skip-around without force (422)", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_VOTING",
      note: "Skip-around",
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.from).toBe("SUBMITTED");
    expect(body.to).toBe("IN_VOTING");
  });

  it("allows skip-around with force:true", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_VOTING",
      note: "Force override",
      force: true,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("IN_VOTING");
  });

  it("returns 409 for same status", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "SUBMITTED",
      note: "Same status",
    });
    expect(res.status).toBe(409);
  });

  it("returns 401 without admin secret", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "UNDER_REVIEW",
      note: "No auth",
    }, "");
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong secret", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "UNDER_REVIEW",
      note: "Wrong auth",
    }, "wrong-secret");
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await changeStatus("nonexistent-id", {
      status: "UNDER_REVIEW",
      note: "Not found",
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid status enum", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "INVALID_STATUS",
      note: "Bad enum",
    });
    expect(res.status).toBe(400);
  });

  it("creates audit trail (StatusChange + ModerationEvent)", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    await changeStatus(idea.id, {
      status: "UNDER_REVIEW",
      note: "Audit test note",
    });

    const statusChanges = await testPrisma.statusChange.findMany({
      where: { ideaId: idea.id },
    });
    expect(statusChanges).toHaveLength(1);
    expect(statusChanges[0].fromStatus).toBe("SUBMITTED");
    expect(statusChanges[0].toStatus).toBe("UNDER_REVIEW");
    expect(statusChanges[0].note).toBe("Audit test note");

    const modEvents = await testPrisma.moderationEvent.findMany({
      where: { targetId: idea.id, targetType: "IDEA" },
    });
    expect(modEvents).toHaveLength(1);
    expect(modEvents[0].action).toBe("STATUS_CHANGE");
  });
});
