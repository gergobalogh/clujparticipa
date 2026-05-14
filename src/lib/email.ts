import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@clujparticipa.ro";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

type SendStatusChangeEmailsInput = {
  idea: {
    id: string;
    title: string;
    status: string;
    submitterParticipantHash: string | null;
    notifyOnStatusChange: boolean;
    unsubscribeToken: string | null;
  };
  adminNote: string;
};

export async function sendStatusChangeEmails({
  idea,
  adminNote,
}: SendStatusChangeEmailsInput): Promise<{ sent: number }> {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping status change emails");
    return { sent: 0 };
  }

  try {
    // Collect opted-in recipients in parallel
    const [submitterEmail, voterRows] = await Promise.all([
      idea.notifyOnStatusChange && idea.submitterParticipantHash
        ? resolveEmail(idea.submitterParticipantHash)
        : Promise.resolve(null),
      prisma.vote.findMany({
        where: {
          ideaId: idea.id,
          notifyOnStatusChange: true,
        },
        select: {
          participantHash: true,
          unsubscribeToken: true,
        },
      }),
    ]);

    // Build deduplicated recipient map: email -> unsubscribeToken
    const recipients = new Map<string, string>();

    if (submitterEmail && idea.unsubscribeToken) {
      recipients.set(submitterEmail, idea.unsubscribeToken);
    }

    const voterEmails = await Promise.all(
      voterRows.map(async (v) => {
        const email = await resolveEmail(v.participantHash);
        return email ? { email, token: v.unsubscribeToken } : null;
      })
    );

    for (const v of voterEmails) {
      if (v?.email && v.token && !recipients.has(v.email)) {
        recipients.set(v.email, v.token);
      }
    }

    if (recipients.size === 0) return { sent: 0 };

    const ideaUrl = `${APP_URL}/ro/ideas/${idea.id}`;

    const emails = Array.from(recipients.entries()).map(([email, token]) => ({
      from: FROM_EMAIL,
      to: email,
      subject: `Actualizare status idee: ${idea.title}`,
      html: `
        <h2>Statusul ideii "${idea.title}" s-a schimbat</h2>
        <p><strong>Noul status:</strong> ${idea.status}</p>
        <p><strong>Notă:</strong> ${adminNote}</p>
        <p><a href="${ideaUrl}">Vezi detalii idee</a></p>
        <hr />
        <p style="font-size:12px;color:#888;">
          <a href="${APP_URL}/api/unsubscribe?token=${token}">Dezabonare</a> — Nu mai doriți să primiți actualizări pentru această idee.
        </p>
      `,
    }));

    const { error } = await resend.batch.send(emails);

    if (error) {
      console.error("Resend batch send error:", error);
      return { sent: 0 };
    }

    return { sent: emails.length };
  } catch (err) {
    console.error("sendStatusChangeEmails error:", err);
    return { sent: 0 };
  }
}

async function resolveEmail(
  participantHash: string
): Promise<string | null> {
  const identity = await prisma.participantIdentity.findUnique({
    where: { participantHash },
    include: { user: { select: { email: true } } },
  });
  return identity?.user?.email ?? null;
}
