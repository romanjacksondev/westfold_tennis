import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { audit } from '@/lib/audit';
import { logger } from '@/lib/logger';

type AuthRequest = { headers?: Record<string, string | string[] | undefined> };

function requestInfo(req: AuthRequest | undefined) {
  const header = (name: string) => {
    const value = req?.headers?.[name];
    return Array.isArray(value) ? value[0] : value;
  };
  return { ip: header('x-forwarded-for')?.split(',')[0]?.trim() ?? null, userAgent: header('user-agent') ?? null };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        const info = requestInfo(req as AuthRequest | undefined);
        // Si no parece un email (p. ej. escribieron la contraseña ahí), no se guarda.
        const safeEmail = email?.includes('@') ? email.slice(0, 120) : undefined;
        const fail = async (reason: string, userId?: string) => {
          logger.warn('auth.login_failed', { reason, email: safeEmail, userId, ip: info.ip });
          await audit({ action: 'LOGIN_FAILURE', entity: 'User', entityId: userId, actor: { id: userId, email: safeEmail }, metadata: { reason, ...info } });
          return null;
        };
        if (!email || !password) return fail('missing_credentials');

        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
          include: { player: { select: { id: true, name: true, nickname: true } } },
        });
        if (!user) return fail('unknown_user');
        if (!user.isActive) return fail('inactive_user', user.id);
        if (!(await bcrypt.compare(password, user.password))) return fail('wrong_password', user.id);

        logger.info('auth.login_success', { userId: user.id, role: user.role });
        await audit({ action: 'LOGIN_SUCCESS', entity: 'User', entityId: user.id, actor: { id: user.id, role: user.role, email: user.email }, metadata: info });

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
        const u = user as { id: string; role?: 'USER' | 'ADMIN'; playerId?: string | null; playerNickname?: string | null };
        token.id = u.id;
        token.role = u.role ?? 'USER';
        token.playerId = u.playerId ?? null;
        token.playerNickname = u.playerNickname ?? null;
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