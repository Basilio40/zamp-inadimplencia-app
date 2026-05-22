import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filtro = searchParams.get('filtro') || 'TODOS';
    const busca = searchParams.get('busca') || '';

    const oscs = await prisma.oSC.findMany({
      where: { cobrancaImediata: true },
      include: { loja: true },
    });

    const result = oscs.map(o => ({
      bkn: o.loja?.bkn || '-',
      loja: o.loja?.nome || '-',
      osc: o.numeroOsc,
      categoria: o.descricao || '-',
      status: o.status,
      valor: o.valor,
      isManeng: true,
    }));

    let filtered = result;
    if (filtro === 'Em Maneng') filtered = result.filter(r => r.isManeng);
    if (filtro === 'Não localizado') filtered = result.filter(r => !r.isManeng);
    if (busca) {
      const q = busca.toLowerCase();
      filtered = filtered.filter(r => 
        r.bkn.includes(q) || r.loja.toLowerCase().includes(q) || (r.osc || '').includes(q)
      );
    }

    return NextResponse.json({ cobranca: filtered });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar cobrança' }, { status: 500 });
  }
}
