import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [lojas, chamados, oscs, preventivas, arts, faturamentos, historicos] = await Promise.all([
      prisma.loja.findMany(),
      prisma.chamado.findMany(),
      prisma.oSC.findMany(),
      prisma.preventiva.findMany(),
      prisma.aRT.findMany(),
      prisma.faturamento.findMany(),
      prisma.historico.findMany({ orderBy: { timestamp: 'desc' }, take: 500 }),
    ]);

    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        lojas,
        chamados,
        oscs,
        preventivas,
        arts,
        faturamentos,
        historicos,
      },
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
