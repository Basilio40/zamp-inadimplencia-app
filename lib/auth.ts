import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
  }
  return session;
}

export function requireAdmin(session: any) {
  if (session.user.perfil !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 });
  }
  return null;
}
