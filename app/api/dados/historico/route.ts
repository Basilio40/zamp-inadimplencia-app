import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const historicos = await prisma.historico.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
    return NextResponse.json({ historicos });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar histórico' }, { status: 500 });
  }
}
