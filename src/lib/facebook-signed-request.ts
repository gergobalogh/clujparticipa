export async function verifySignedRequest(
  signedRequest: string,
  appSecret: string,
): Promise<Record<string, unknown> | null> {
  const parts = signedRequest.split(".");
  if (parts.length !== 2) return null;

  const [encodedSig, encodedPayload] = parts;

  const payloadJson = base64UrlDecode(encodedPayload);
  if (!payloadJson) return null;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return null;
  }

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
    encoder.encode(encodedPayload),
  );

  const providedSig = base64UrlDecodeToBytes(encodedSig);
  if (!providedSig) return null;

  const expected = new Uint8Array(signature);
  const provided = new Uint8Array(providedSig);
  if (expected.length !== provided.length) return null;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected[i] ^ provided[i];
  }
  if (mismatch !== 0) return null;

  return payload;
}

function base64UrlDecode(str: string): string | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) base64 += "==";
    else if (pad === 3) base64 += "=";
    return atob(base64);
  } catch {
    return null;
  }
}

function base64UrlDecodeToBytes(str: string): ArrayBuffer | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) base64 += "==";
    else if (pad === 3) base64 += "=";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  } catch {
    return null;
  }
}
