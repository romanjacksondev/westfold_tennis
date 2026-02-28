import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from "bcrypt";
import { prisma } from '@/utils/prisma';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user /*&& bcrypt.compareSync(credentials.password, user.password)*/) {
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session }) {
      //async session({ session, token }) {
      //session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,

  debug: true,
});

export { handler as GET, handler as POST };
