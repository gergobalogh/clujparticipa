import { vi } from "vitest";

export function mockAnonymousAuth() {
  return {
    getAuthSession: vi.fn().mockResolvedValue(null),
    resolveParticipantHash: vi.fn().mockImplementation(
      async (_session: null, token: string | null) => {
        if (!token) return null;
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }
    ),
  };
}

export function mockAuthenticatedAuth(
  userId = "user-001",
  participantHash = "hash-authenticated-001"
) {
  return {
    getAuthSession: vi.fn().mockResolvedValue({
      user: { id: userId },
      participantHash,
    }),
    resolveParticipantHash: vi.fn().mockResolvedValue(participantHash),
  };
}
