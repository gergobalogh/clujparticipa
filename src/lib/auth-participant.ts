import { auth } from "@/auth";
import { hashParticipantToken } from "@/lib/participant";

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function resolveParticipantHash(
  session: { participantHash?: string } | null,
  anonymousToken: string | null,
): Promise<string | null> {
  if (session?.participantHash) return session.participantHash;
  if (anonymousToken) return await hashParticipantToken(anonymousToken);
  return null;
}
