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
        console.log('[AUTH] Tentativa de login:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Email ou senha vazios');
          return null;
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log('[AUTH] Usuario nao encontrado:', credentials.email);
          return null;
        }
        if (!user.ativo) {
          console.log('[AUTH] Usuario inativo:', credentials.email);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.senhaHash);
        if (!valid) {
          console.log('[AUTH] Senha invalida para:', credentials.email);
          return null;
        }

        console.log('[AUTH] Login OK:', credentials.email);
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
  debug: !process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error('[NEXTAUTH ERROR]', code, metadata);
    },
    warn(code) {
      console.warn('[NEXTAUTH WARN]', code);
    },
  },
});

export { handler as GET, handler as POST };
