import { vi } from "vitest";

/**
 * Creates mock implementations for auth-participant module
 * that simulate an anonymous participant.
 */
export function mockAnonymousAuth() {
  const getAuthSession = vi.fn().mockResolvedValue(null);
  const resolveParticipantHash = vi.fn().mockResolvedValue("test-participant-hash-abc123");

  return { getAuthSession, resolveParticipantHash };
}
