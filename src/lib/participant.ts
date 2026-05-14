/**
 * Minimum length for a participant token (generated client-side).
 * Tokens are UUID-like random strings; this just prevents trivial abuse.
 */
const MIN_TOKEN_LENGTH = 16;

/**
 * Hash a participant token with SHA-256.
 * Only the hash is stored server-side — the raw token never reaches the database.
 * Uses Web Crypto API for Edge Runtime compatibility.
 */
export async function hashParticipantToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate that a participant token looks reasonable.
 * Returns an error message key if invalid, or null if valid.
 */
export function validateParticipantToken(token: unknown): string | null {
  if (typeof token !== "string" || token.trim().length < MIN_TOKEN_LENGTH) {
    return "ApiErrors.invalidParticipantToken";
  }
  return null;
}
