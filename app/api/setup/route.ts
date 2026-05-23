import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const senhaHash = await bcrypt.hash('admin123', 10);
    const usuarios = [
      { email: 'admin@zamp.com', nome: 'Administrador', senhaHash, perfil: 'ADMIN' },
      { email: 'coord@zamp.com', nome: 'Coordenador', senhaHash, perfil: 'COORDENADOR' },
      { email: 'super@zamp.com', nome: 'Supervisor', senhaHash, perfil: 'SUPERVISOR', supervisorRegional: 'SP' },
      { email: 'leitor@zamp.com', nome: 'Leitor', senhaHash, perfil: 'LEITURA' },
    ];

    const criados = [];
    for (const u of usuarios) {
      const user = await prisma.usuario.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
      criados.push(user.email);
    }

    return NextResponse.json({
      ok: true,
      message: 'Usuarios criados/atualizados com sucesso',
      usuarios: criados,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
