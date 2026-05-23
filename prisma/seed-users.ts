import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10);
  const usuarios = [
    { email: 'admin@zamp.com', nome: 'Administrador', senhaHash, perfil: 'ADMIN' },
    { email: 'coord@zamp.com', nome: 'Coordenador', senhaHash, perfil: 'COORDENADOR' },
    { email: 'super@zamp.com', nome: 'Supervisor', senhaHash, perfil: 'SUPERVISOR', supervisorRegional: 'SP' },
    { email: 'leitor@zamp.com', nome: 'Leitor', senhaHash, perfil: 'LEITURA' },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Usuario ${u.email} criado/atualizado.`);
  }

  console.log('Seed de usuarios finalizado!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
