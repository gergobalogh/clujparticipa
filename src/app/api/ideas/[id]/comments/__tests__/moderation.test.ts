import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { createIdea, createComment } from "@/test/helpers/factories";
import { _resetBuckets } from "@/lib/rate-limit";
import { mockAnonymousAuth } from "@/test/helpers/auth-mocks";

// ── Mock: Prisma uses test client ──
vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

// ── Mock: Auth ──
const authMocks = mockAnonymousAuth();
vi.mock("@/lib/auth-participant", () => ({
  getAuthSession: authMocks.getAuthSession,
  resolveParticipantHash: authMocks.resolveParticipantHash,
}));

// ── Mock: OpenAI moderation adapter (COSTLY - never call real API) ──
vi.mock("@/lib/openai-moderation-adapter", () => ({
  callOpenAIModeration: vi.fn(),
  probeOpenAI: vi.fn().mockResolvedValue(true),
}));

// ── Mock: moderateText domain function ──
vi.mock("@/lib/openai-moderation", () => ({
  moderateText: vi.fn(),
  ModerationResult: undefined,
}));

import { callOpenAIModeration } from "@/lib/openai-moderation-adapter";
import { moderateText } from "@/lib/openai-moderation";

const TOKEN = "anonymous-test-token-1234";

// ── Helpers ──

async function postComment(
  id: string,
  body: { text: string; parentId?: string },
  token?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["x-participant-token"] = token;
  const req = new NextRequest(
    `http://localhost:3000/api/ideas/${id}/comments`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );
  const { POST } = await import("../route");
  return POST(req, { params: Promise.resolve({ id }) });
}

async function getComments(id: string) {
  const req = new NextRequest(
    `http://localhost:3000/api/ideas/${id}/comments`
  );
  const { GET } = await import("../route");
  return GET(req, { params: Promise.resolve({ id }) });
}

// ── Walking Skeleton: Clean comment ──

describe("Comment auto-moderation", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
    _resetBuckets();
    vi.resetAllMocks();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  // ── WS-1: Walking Skeleton — clean comment stays VISIBLE ──

  describe("WS-1: Clean comment is visible immediately", () => {
    it("saves clean comment as VISIBLE and returns HTTP 201 with no ModerationEvent", async () => {
      vi.mocked(moderateText).mockResolvedValue({
        flagged: false,
        categories: [],
      });

      const idea = await createIdea(testPrisma);
      const res = await postComment(idea.id, { text: "Great idea!" }, TOKEN);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.status).toBe("VISIBLE");

      // No AUTO_FLAG ModerationEvent created for clean comments
      const modEvents = await testPrisma.moderationEvent.findMany({
        where: { targetType: "COMMENT", targetId: body.id },
      });
      expect(modEvents).toHaveLength(0);
    });
  });

  // ── WS-2: Walking Skeleton — toxic comment gets FLAGGED ──

  describe("WS-2: Toxic comment is flagged and held for review", () => {
    it("saves flagged comment as FLAGGED, returns HTTP 202, and creates AUTO_FLAG ModerationEvent with categories", async () => {
      vi.mocked(moderateText).mockResolvedValue({
        flagged: true,
        categories: ["hate", "harassment"],
      });

      const idea = await createIdea(testPrisma);
      const res = await postComment(
        idea.id,
        { text: "Offensive toxic content here" },
        TOKEN
      );

      expect(res.status).toBe(202);
      const body = await res.json();
      expect(body.status).toBe("FLAGGED");
      expect(body.message).toBeDefined();

      // AUTO_FLAG ModerationEvent created with categories in reason
      const modEvents = await testPrisma.moderationEvent.findMany({
        where: { targetType: "COMMENT", targetId: body.id },
      });
      expect(modEvents).toHaveLength(1);
      expect(modEvents[0].action).toBe("AUTO_FLAG");
      expect(modEvents[0].reason).toBe("auto_flag:hate,harassment");
    });
  });

  // ── D11: Flagged comments excluded from GET feed ──

  describe("Flagged comments are not publicly visible", () => {
    it("does not return FLAGGED comments in the public comment feed", async () => {
      const idea = await createIdea(testPrisma);
      await createComment(testPrisma, idea.id, {
        text: "Visible comment",
        status: "VISIBLE",
      });
      await createComment(testPrisma, idea.id, {
        text: "Flagged comment",
        status: "FLAGGED",
      });

      const res = await getComments(idea.id);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.comments).toHaveLength(1);
      expect(body.comments[0].text).toBe("Visible comment");
    });
  });

  // ── US-5 / e1: Fail-open on OpenAI API timeout ──

  describe("Fail-open when moderation service times out", () => {
    it("saves comment as VISIBLE and returns HTTP 201 when OpenAI times out", async () => {
      vi.mocked(moderateText).mockRejectedValue(
        new DOMException("The operation was aborted", "AbortError")
      );
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const idea = await createIdea(testPrisma);
      const res = await postComment(
        idea.id,
        { text: "Comment during timeout" },
        TOKEN
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.status).toBe("VISIBLE");

      // Warning logged for admin follow-up
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ── Fail-open on OpenAI API 5xx error ──

  describe("Fail-open when moderation service returns server error", () => {
    it("saves comment as VISIBLE and returns HTTP 201 when OpenAI returns 5xx", async () => {
      vi.mocked(moderateText).mockRejectedValue(
        new Error("OpenAI API returned 503")
      );
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const idea = await createIdea(testPrisma);
      const res = await postComment(
        idea.id,
        { text: "Comment during server error" },
        TOKEN
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.status).toBe("VISIBLE");

      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ── Fail-open on missing OPENAI_API_KEY ──

  describe("Fail-open when API key is not configured", () => {
    it("saves comment as VISIBLE and returns HTTP 201 when OPENAI_API_KEY is missing", async () => {
      vi.mocked(moderateText).mockRejectedValue(
        new Error("OPENAI_API_KEY is not set")
      );
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const idea = await createIdea(testPrisma);
      const res = await postComment(
        idea.id,
        { text: "Comment without API key" },
        TOKEN
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.status).toBe("VISIBLE");

      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ── Multilingual screening: Romanian ──

  describe("Romanian text is screened correctly", () => {
    it("passes clean Romanian text and flags toxic Romanian text", async () => {
      // First: clean Romanian
      vi.mocked(moderateText).mockResolvedValue({
        flagged: false,
        categories: [],
      });

      const idea = await createIdea(testPrisma);
      const cleanRes = await postComment(
        idea.id,
        { text: "Aceasta este o idee foarte bună pentru comunitate" },
        TOKEN
      );
      expect(cleanRes.status).toBe(201);

      // Reset for flagged Romanian
      await truncateAll(testPrisma);
      _resetBuckets();

      vi.mocked(moderateText).mockResolvedValue({
        flagged: true,
        categories: ["hate"],
      });

      const idea2 = await createIdea(testPrisma);
      const flaggedRes = await postComment(
        idea2.id,
        { text: "Conținut toxic în limba română" },
        TOKEN
      );
      expect(flaggedRes.status).toBe(202);
      const body = await flaggedRes.json();
      expect(body.status).toBe("FLAGGED");
    });
  });

  // ── Multilingual screening: Hungarian ──

  describe("Hungarian text is screened correctly", () => {
    it("passes clean Hungarian text and flags toxic Hungarian text", async () => {
      // First: clean Hungarian
      vi.mocked(moderateText).mockResolvedValue({
        flagged: false,
        categories: [],
      });

      const idea = await createIdea(testPrisma);
      const cleanRes = await postComment(
        idea.id,
        { text: "Ez egy nagyon jó ötlet a közösség számára" },
        TOKEN
      );
      expect(cleanRes.status).toBe(201);

      // Reset for flagged Hungarian
      await truncateAll(testPrisma);
      _resetBuckets();

      vi.mocked(moderateText).mockResolvedValue({
        flagged: true,
        categories: ["violence"],
      });

      const idea2 = await createIdea(testPrisma);
      const flaggedRes = await postComment(
        idea2.id,
        { text: "Mérgező tartalom magyar nyelven" },
        TOKEN
      );
      expect(flaggedRes.status).toBe(202);
      const body = await flaggedRes.json();
      expect(body.status).toBe("FLAGGED");
    });
  });

  // ── Multiple categories in reason field (US-2) ──

  describe("Multiple flagged categories are recorded in audit trail", () => {
    it("stores all flagged categories in the AUTO_FLAG ModerationEvent reason", async () => {
      vi.mocked(moderateText).mockResolvedValue({
        flagged: true,
        categories: ["hate", "harassment", "violence"],
      });

      const idea = await createIdea(testPrisma);
      const res = await postComment(
        idea.id,
        { text: "Severely toxic multi-category content" },
        TOKEN
      );

      expect(res.status).toBe(202);
      const body = await res.json();

      const modEvents = await testPrisma.moderationEvent.findMany({
        where: { targetType: "COMMENT", targetId: body.id },
      });
      expect(modEvents).toHaveLength(1);
      expect(modEvents[0].reason).toBe("auto_flag:hate,harassment,violence");
    });
  });

  // ── Moderation latency (US-1 AC) ──

  describe("Moderation adds acceptable latency to comment creation", () => {
    it("completes comment creation with moderation within 2 seconds", async () => {
      vi.mocked(moderateText).mockImplementation(async () => {
        // Simulate realistic API latency
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { flagged: false, categories: [] };
      });

      const idea = await createIdea(testPrisma);
      const start = Date.now();
      const res = await postComment(
        idea.id,
        { text: "Latency test comment" },
        TOKEN
      );
      const elapsed = Date.now() - start;

      expect(res.status).toBe(201);
      expect(elapsed).toBeLessThan(2000);
    });
  });

  // ── Rate limit still enforced (no regression) ──

  describe("Rate limit is still enforced on comment creation", () => {
    it("rejects comments when rate limit is exceeded, even with moderation", async () => {
      vi.mocked(moderateText).mockResolvedValue({
        flagged: false,
        categories: [],
      });

      const idea = await createIdea(testPrisma);

      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await postComment(idea.id, { text: `Comment ${i}` }, TOKEN);
      }

      // Next request should be rate-limited
      const res = await postComment(
        idea.id,
        { text: "Over limit comment" },
        TOKEN
      );
      expect(res.status).toBe(429);
    });
  });

  // ── Admin approves FLAGGED comment (US-2/US-3) ──

  describe("Admin approves a flagged comment", () => {
    it("changes FLAGGED to VISIBLE and creates APPROVE ModerationEvent", async () => {
      const idea = await createIdea(testPrisma);
      const comment = await createComment(testPrisma, idea.id, {
        text: "Flagged comment",
        status: "FLAGGED",
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-admin-secret": "test-admin-secret-12345",
      };
      const req = new NextRequest(
        `http://localhost:3000/api/admin/comments/${comment.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: "VISIBLE",
            reason: "False positive - legitimate civic criticism",
          }),
        }
      );
      const { PATCH } = await import(
        "@/app/api/admin/comments/[id]/route"
      );
      const res = await PATCH(req, {
        params: Promise.resolve({ id: comment.id }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe("VISIBLE");

      // APPROVE ModerationEvent created
      const modEvents = await testPrisma.moderationEvent.findMany({
        where: { targetType: "COMMENT", targetId: comment.id },
      });
      expect(modEvents).toHaveLength(1);
      expect(modEvents[0].action).toBe("APPROVE");
      expect(modEvents[0].reason).toBe(
        "False positive - legitimate civic criticism"
      );
    });
  });

  // ── Admin hides FLAGGED comment (US-2/US-3) ──

  describe("Admin hides a flagged comment", () => {
    it("changes FLAGGED to HIDDEN and creates HIDE ModerationEvent", async () => {
      const idea = await createIdea(testPrisma);
      const comment = await createComment(testPrisma, idea.id, {
        text: "Flagged comment",
        status: "FLAGGED",
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-admin-secret": "test-admin-secret-12345",
      };
      const req = new NextRequest(
        `http://localhost:3000/api/admin/comments/${comment.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: "HIDDEN",
            reason: "Confirmed toxic content",
          }),
        }
      );
      const { PATCH } = await import(
        "@/app/api/admin/comments/[id]/route"
      );
      const res = await PATCH(req, {
        params: Promise.resolve({ id: comment.id }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe("HIDDEN");

      // HIDE ModerationEvent created
      const modEvents = await testPrisma.moderationEvent.findMany({
        where: { targetType: "COMMENT", targetId: comment.id },
      });
      expect(modEvents).toHaveLength(1);
      expect(modEvents[0].action).toBe("HIDE");
      expect(modEvents[0].reason).toBe("Confirmed toxic content");
    });
  });

  // ── Admin cannot manually set FLAGGED status (only system can) ──

  describe("Admin cannot set comment status to FLAGGED", () => {
    it("rejects admin attempt to set status to FLAGGED", async () => {
      const idea = await createIdea(testPrisma);
      const comment = await createComment(testPrisma, idea.id, {
        text: "Visible comment",
        status: "VISIBLE",
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-admin-secret": "test-admin-secret-12345",
      };
      const req = new NextRequest(
        `http://localhost:3000/api/admin/comments/${comment.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status: "FLAGGED",
            reason: "Should not be allowed",
          }),
        }
      );
      const { PATCH } = await import(
        "@/app/api/admin/comments/[id]/route"
      );
      const res = await PATCH(req, {
        params: Promise.resolve({ id: comment.id }),
      });

      // FLAGGED is only set by the system, not by admin action
      expect(res.status).toBe(400);
    });
  });

  // ── US-4: i18n keys for moderation feedback exist ──

  describe("i18n keys for moderation feedback exist in all locales", () => {
    it("has moderation.underReview key in RO, HU, and EN locale files", async () => {
      const ro = await import("@/../src/i18n/messages/ro.json");
      const hu = await import("@/../src/i18n/messages/hu.json");
      const en = await import("@/../src/i18n/messages/en.json");

      const getKey = (obj: Record<string, unknown>, path: string): unknown => {
        const parts = path.split(".");
        let current: unknown = obj;
        for (const part of parts) {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return undefined;
          }
        }
        return current;
      };

      expect(getKey(ro as Record<string, unknown>, "Moderation.underReview")).toBeDefined();
      expect(getKey(hu as Record<string, unknown>, "Moderation.underReview")).toBeDefined();
      expect(getKey(en as Record<string, unknown>, "Moderation.underReview")).toBeDefined();
    });
  });
});
