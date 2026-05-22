import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uf = searchParams.get('uf') || '';
    const status = searchParams.get('status') || 'TODOS';
    const busca = searchParams.get('busca') || '';

    const lojas = await prisma.loja.findMany({
      where: uf ? { uf } : undefined,
      include: {
        chamados: { where: { status: { not: 'CONCLUIDO' } }, include: { oscs: true } },
        faturamentos: { where: { tipo: 'CORRETIVA' } },
      },
    });

    const corretivas = lojas
      .filter(l => l.chamados.length > 0)
      .map(l => ({
        bkn: l.bkn || '-',
        cnpj: l.cnpj || '-',
        loja: l.nome,
        uf: l.uf || '-',
        oscs: l.chamados.reduce((s, c) => s + c.oscs.length, 0),
        valorTotal: l.chamados.reduce((s, c) => s + (c.valorProposta || 0), 0),
        materialParado: l.chamados.reduce((s, c) => s + c.oscs.reduce((os, o) => os + (o.valor || 0), 0), 0),
        supervisor: l.supervisor || '-',
        statusFat: l.faturamentos[0]?.status || 'PENDENTE',
        nf: l.faturamentos[0]?.nfNumero || '',
      }))
      .filter(c => {
        if (status !== 'TODOS' && c.statusFat !== status) return false;
        if (!busca) return true;
        const q = busca.toLowerCase();
        return c.bkn.includes(q) || c.loja.toLowerCase().includes(q) || c.uf.toLowerCase().includes(q);
      });

    return NextResponse.json({ corretivas });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar corretivas' }, { status: 500 });
  }
}
