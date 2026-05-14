import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { hashParticipantToken } from "@/lib/participant";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        await ensureParticipantIdentity(user.id);
        const identity = await prisma.participantIdentity.findUnique({
          where: { userId: user.id },
        });
        if (identity) {
          token.participantHash = identity.participantHash;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      if (token?.participantHash) {
        session.participantHash = token.participantHash as string;
      }
      return session;
    },
  },
});

async function ensureParticipantIdentity(userId: string) {
  const existing = await prisma.participantIdentity.findUnique({
    where: { userId },
  });
  if (existing) return;

  const participantHash = await hashParticipantToken(`identity:${userId}`);
  await prisma.participantIdentity.create({
    data: { userId, participantHash },
  });
}

declare module "next-auth" {
  interface Session {
    participantHash?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    participantHash?: string;
  }
}
