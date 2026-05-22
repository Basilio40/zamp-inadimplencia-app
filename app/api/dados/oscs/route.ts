import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'TODOS';
    const busca = searchParams.get('busca') || '';

    const where: any = {};
    if (status !== 'TODOS') where.status = status;

    const oscs = await prisma.oSC.findMany({
      where,
      include: { loja: true },
    });

    const filtered = oscs.filter(o => {
      if (!busca) return true;
      const q = busca.toLowerCase();
      return (o.loja?.bkn || '').includes(q) || 
             (o.loja?.nome || '').toLowerCase().includes(q) ||
             (o.numeroOsc || '').includes(q) ||
             (o.descricao || '').toLowerCase().includes(q);
    });

    return NextResponse.json({ oscs: filtered });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar OSCs' }, { status: 500 });
  }
}
