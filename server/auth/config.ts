import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/client";
import { usernameFromEmail } from "@/lib/slug";

async function generateUniqueUsername(email: string, name: string | null): Promise<string> {
  const base = usernameFromEmail(email, name);
  let candidate = base;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

// PrismaAdapter.createUser chama prisma.user.create direto com os campos do provider OAuth.
// Como User.username é NOT NULL no schema, precisamos injetar antes do create.
function withUsernameAdapter(base: Adapter): Adapter {
  const originalCreateUser = base.createUser!.bind(base);
  return {
    ...base,
    createUser: async (data: AdapterUser) => {
      const username = await generateUniqueUsername(data.email, data.name ?? null);
      return originalCreateUser({ ...data, username } as AdapterUser);
    },
  };
}

export const authConfig = {
  adapter: withUsernameAdapter(PrismaAdapter(prisma)),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string }).username ?? token.username;
      }
      // Garante username carregado mesmo em sessões antigas
      if (token.id && !token.username) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { username: true },
        });
        token.username = dbUser?.username ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.username = (token.username as string) ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
