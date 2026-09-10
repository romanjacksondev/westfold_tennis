import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
          include: { player: { select: { id: true, name: true, nickname: true } } },
        });
        if (!user || !user.isActive) return null;
        if (!(await bcrypt.compare(password, user.password))) return null;

        const displayName = user.player
          ? (user.player.nickname ? `${user.player.name} "${user.player.nickname}"` : user.player.name)
          : user.name;

        return {
          id: user.id,
          name: displayName,
          email: user.email,
          role: user.role,
          playerId: user.player?.id ?? null,
          playerNickname: user.player?.nickname ?? null,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerId = (user as any).playerId ?? null;
        token.playerNickname = (user as any).playerNickname ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? 'USER';
        session.user.playerId = token.playerId ?? null;
        session.user.playerNickname = token.playerNickname ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_DEBUG === 'true',
};