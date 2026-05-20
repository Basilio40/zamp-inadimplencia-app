import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.ativo) return null;

        const valid = await bcrypt.compare(credentials.password, user.senhaHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.nome,
          perfil: user.perfil,
          supervisorRegional: user.supervisorRegional,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.perfil = (user as any).perfil;
        token.supervisorRegional = (user as any).supervisorRegional;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).perfil = token.perfil;
      (session.user as any).supervisorRegional = token.supervisorRegional;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
