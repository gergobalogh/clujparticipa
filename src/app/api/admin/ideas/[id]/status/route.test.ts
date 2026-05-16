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
    body: { status: string; note: string; force?: boolean; mergedIntoIdeaId?: string },
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

  it("allows valid transition SUBMITTED→IN_VOTING", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_VOTING",
      note: "Sending to voting",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("IN_VOTING");
  });

  it("allows valid transition SELECTED→ACCEPTED", async () => {
    const idea = await createIdea(testPrisma, { status: "SELECTED" });
    const res = await changeStatus(idea.id, {
      status: "ACCEPTED",
      note: "City accepts this idea",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ACCEPTED");
  });

  it("allows valid transition SELECTED→NEEDS_REVISION", async () => {
    const idea = await createIdea(testPrisma, { status: "SELECTED" });
    const res = await changeStatus(idea.id, {
      status: "NEEDS_REVISION",
      note: "Please add more detail",
    });
    expect(res.status).toBe(200);
  });

  it("allows valid transition SELECTED→REJECTED", async () => {
    const idea = await createIdea(testPrisma, { status: "SELECTED" });
    const res = await changeStatus(idea.id, {
      status: "REJECTED",
      note: "Not feasible",
    });
    expect(res.status).toBe(200);
  });

  it("sets mergedIntoIdeaId when transitioning to MERGED", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const targetIdea = await createIdea(testPrisma, { status: "IN_VOTING" });
    const res = await changeStatus(idea.id, {
      status: "MERGED",
      note: "Duplicate",
      mergedIntoIdeaId: targetIdea.id,
    });
    expect(res.status).toBe(200);
  });

  it("rejects invalid transition SUBMITTED→COMPLETED without force (422)", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "COMPLETED",
      note: "Skip-around",
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.from).toBe("SUBMITTED");
    expect(body.to).toBe("COMPLETED");
  });

  it("rejects transition from terminal status REJECTED (422)", async () => {
    const idea = await createIdea(testPrisma, { status: "REJECTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_VOTING",
      note: "Reopen attempt",
    });
    expect(res.status).toBe(422);
  });

  it("allows skip-around with force:true", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_PROGRESS",
      note: "Force override",
      force: true,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("IN_PROGRESS");
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
      status: "IN_VOTING",
      note: "No auth",
    }, "");
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong secret", async () => {
    const idea = await createIdea(testPrisma, { status: "SUBMITTED" });
    const res = await changeStatus(idea.id, {
      status: "IN_VOTING",
      note: "Wrong auth",
    }, "wrong-secret");
    expect(res.status).toBe(401);
  });

  it("returns 404 for nonexistent idea", async () => {
    const res = await changeStatus("nonexistent-id", {
      status: "IN_VOTING",
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
      status: "IN_VOTING",
      note: "Audit test note",
    });

    const statusChanges = await testPrisma.statusChange.findMany({
      where: { ideaId: idea.id },
    });
    expect(statusChanges).toHaveLength(1);
    expect(statusChanges[0].fromStatus).toBe("SUBMITTED");
    expect(statusChanges[0].toStatus).toBe("IN_VOTING");
    expect(statusChanges[0].note).toBe("Audit test note");

    const modEvents = await testPrisma.moderationEvent.findMany({
      where: { targetId: idea.id, targetType: "IDEA" },
    });
    expect(modEvents).toHaveLength(1);
    expect(modEvents[0].action).toBe("STATUS_CHANGE");
  });
});
