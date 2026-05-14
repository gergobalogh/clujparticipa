import { describe, it, expect, afterEach, afterAll, vi } from "vitest";
import { testPrisma } from "@/test/helpers/prisma";
import { truncateAll } from "@/test/helpers/db-reset";
import { POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: testPrisma,
}));

async function createSignedRequest(
  payload: Record<string, unknown>,
  appSecret: string,
): Promise<string> {
  const payloadBase64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64),
  );
  const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${sigBase64}.${payloadBase64}`;
}

describe("POST /api/facebook-data-deletion", () => {
  afterEach(async () => {
    await truncateAll(testPrisma);
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  it("returns 400 when signed_request is missing", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/facebook-data-deletion",
      { method: "POST" },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when signed_request is invalid", async () => {
    const formData = new FormData();
    formData.append("signed_request", "garbage-value");
    const req = new NextRequest(
      "http://localhost:3000/api/facebook-data-deletion",
      { method: "POST", body: formData },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("deletes user and returns confirmation for valid request", async () => {
    const user = await testPrisma.user.create({
      data: { email: "fb-test@example.com", name: "FB User" },
    });
    await testPrisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider: "facebook",
        providerAccountId: "fb-12345",
      },
    });

    const sr = await createSignedRequest(
      { user_id: "fb-12345" },
      "test-fb-secret",
    );
    const formData = new FormData();
    formData.append("signed_request", sr);

    const req = new NextRequest(
      "http://localhost:3000/api/facebook-data-deletion",
      { method: "POST", body: formData },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.url).toContain("/data-deletion?confirmation_code=");
    expect(body.confirmation_code).toBeTruthy();

    const deletedUser = await testPrisma.user.findUnique({
      where: { id: user.id },
    });
    expect(deletedUser).toBeNull();

    const deletionRequest = await testPrisma.dataDeletionRequest.findUnique({
      where: { confirmationCode: body.confirmation_code },
    });
    expect(deletionRequest?.status).toBe("completed");
    expect(deletionRequest?.completedAt).not.toBeNull();
  });

  it("handles user-not-found gracefully", async () => {
    const sr = await createSignedRequest(
      { user_id: "fb-nonexistent" },
      "test-fb-secret",
    );
    const formData = new FormData();
    formData.append("signed_request", sr);

    const req = new NextRequest(
      "http://localhost:3000/api/facebook-data-deletion",
      { method: "POST", body: formData },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.confirmation_code).toBeTruthy();

    const deletionRequest = await testPrisma.dataDeletionRequest.findUnique({
      where: { confirmationCode: body.confirmation_code },
    });
    expect(deletionRequest?.status).toBe("completed");
    expect(deletionRequest?.userId).toBeNull();
  });

  it("returns existing confirmation for already-deleted user", async () => {
    const existingCode = "existing-code-abc";
    await testPrisma.dataDeletionRequest.create({
      data: {
        confirmationCode: existingCode,
        provider: "facebook",
        providerAccountId: "fb-already-deleted",
        status: "completed",
        completedAt: new Date(),
      },
    });

    const sr = await createSignedRequest(
      { user_id: "fb-already-deleted" },
      "test-fb-secret",
    );
    const formData = new FormData();
    formData.append("signed_request", sr);

    const req = new NextRequest(
      "http://localhost:3000/api/facebook-data-deletion",
      { method: "POST", body: formData },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.confirmation_code).toBe(existingCode);
  });
});
