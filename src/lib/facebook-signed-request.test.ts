import { describe, it, expect } from "vitest";
import { verifySignedRequest } from "./facebook-signed-request";

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

describe("verifySignedRequest", () => {
  const appSecret = "test-facebook-secret";

  it("returns null for malformed input (no dot separator)", async () => {
    const result = await verifySignedRequest("noseparatordot", appSecret);
    expect(result).toBeNull();
  });

  it("returns null for empty string", async () => {
    const result = await verifySignedRequest("", appSecret);
    expect(result).toBeNull();
  });

  it("returns null for invalid base64url", async () => {
    const result = await verifySignedRequest("!!!.!!!", appSecret);
    expect(result).toBeNull();
  });

  it("returns null for valid structure but wrong signature", async () => {
    const payload = btoa(JSON.stringify({ user_id: "123" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const wrongSig = btoa("wrong-signature-bytes")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const result = await verifySignedRequest(
      `${wrongSig}.${payload}`,
      appSecret,
    );
    expect(result).toBeNull();
  });

  it("returns null for wrong app secret", async () => {
    const sr = await createSignedRequest({ user_id: "123" }, appSecret);
    const result = await verifySignedRequest(sr, "wrong-secret");
    expect(result).toBeNull();
  });

  it("returns parsed payload for a valid signed_request", async () => {
    const sr = await createSignedRequest({ user_id: "123456" }, appSecret);
    const result = await verifySignedRequest(sr, appSecret);
    expect(result).toEqual({ user_id: "123456" });
  });

  it("handles payload with multiple fields", async () => {
    const payload = { user_id: "abc", algorithm: "HMAC-SHA-256" };
    const sr = await createSignedRequest(payload, appSecret);
    const result = await verifySignedRequest(sr, appSecret);
    expect(result).toEqual(payload);
  });
});
