import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'TODOS';
    const busca = searchParams.get('busca') || '';

    const lojas = await prisma.loja.findMany({
      include: {
        chamados: { where: { status: { not: 'CONCLUIDO' } }, include: { oscs: true } },
        preventivas: { where: { status: 'PENDENTE' } },
        faturamentos: true,
      },
    });

    const bloqueio = lojas.map((loja) => {
      const corrVal = loja.chamados.reduce((s, c) => s + (c.valorProposta || 0), 0);
      const prevVal = loja.preventivas.reduce((s, p) => s + (p.valorTotal || 0), 0);
      
      let tipoBloqueio: 'CORRETIVA' | 'PREVENTIVA' | 'AMBAS' | null = null;
      if (corrVal > 0 && prevVal > 0) tipoBloqueio = 'AMBAS';
      else if (corrVal > 0) tipoBloqueio = 'CORRETIVA';
      else if (prevVal > 0) tipoBloqueio = 'PREVENTIVA';

      return {
        bkn: loja.bkn || '-',
        cnpj: loja.cnpj || '-',
        loja: loja.nome,
        uf: loja.uf || '-',
        corrVal,
        prevVal,
        tipo: tipoBloqueio,
      };
    }).filter(b => b.tipo !== null);

    let filtered = bloqueio;
    if (tipo !== 'TODOS') filtered = filtered.filter(b => b.tipo === tipo);
    if (busca) {
      const q = busca.toLowerCase();
      filtered = filtered.filter(b => 
        b.bkn.includes(q) || b.loja.toLowerCase().includes(q) || b.uf.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ bloqueio: filtered.sort((a, b) => (b.corrVal + b.prevVal) - (a.corrVal + a.prevVal)) });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar bloqueio' }, { status: 500 });
  }
}
