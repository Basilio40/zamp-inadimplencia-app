import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const corretivas = await prisma.chamado.findMany({
      where: { status: { not: 'CONCLUIDO' } },
      include: { loja: true, oscs: true },
    });

    const preventivas = await prisma.preventiva.findMany({
      where: { status: 'PENDENTE' },
      include: { loja: true },
    });

    const cobranca = await prisma.oSC.findMany({
      where: { cobrancaImediata: true },
      include: { loja: true },
    });

    const totalCorretivas = corretivas.length;
    const valorCorretivas = corretivas.reduce((s, c) => s + (c.valorProposta || 0), 0);
    const materialParado = corretivas.reduce((s, c) => s + c.oscs.reduce((os, o) => os + (o.valor || 0), 0), 0);

    const totalPreventivasPendentes = preventivas.length;
    const valorPreventivasPendentes = preventivas.reduce((s, p) => s + (p.valorTotal || 0), 0);

    const totalCobrancaImediata = cobranca.length;
    const valorCobrancaImediata = cobranca.reduce((s, o) => s + (o.valor || 0), 0);

    const topLoja = corretivas.sort((a, b) => (b.valorProposta || 0) - (a.valorProposta || 0))[0];

    const ufData = await prisma.loja.groupBy({
      by: ['uf'],
      _count: { id: true },
      where: { chamados: { some: { status: { not: 'CONCLUIDO' } } } },
    });

    const ufAggregation = await Promise.all(
      ufData.map(async (u) => {
        const lojas = await prisma.loja.findMany({
          where: { uf: u.uf },
          include: { chamados: { include: { oscs: true } } },
        });
        const valorTotal = lojas.reduce((s, l) => s + l.chamados.reduce((cs, c) => cs + (c.valorProposta || 0), 0), 0);
        const valorMaterial = lojas.reduce((s, l) => s + l.chamados.reduce((cs, c) => cs + c.oscs.reduce((os, o) => os + (o.valor || 0), 0), 0), 0);
        return { uf: u.uf || '-', count: u._count.id, valorTotal, valorMaterial };
      })
    );

    return NextResponse.json({
      totalCorretivas,
      lojasInadimplentes: new Set(corretivas.map(c => c.lojaId)).size,
      valorCorretivas,
      materialParado,
      totalPreventivasPendentes,
      lojasPreventivasPendentes: new Set(preventivas.map(p => p.lojaId)).size,
      valorPreventivasPendentes,
      totalCobrancaImediata,
      valorCobrancaImediata,
      topLojaBkn: topLoja?.loja?.bkn || '-',
      topLojaNome: topLoja?.loja?.nome || '-',
      topLojaValor: topLoja?.valorProposta || 0,
      ufAggregation: ufAggregation.sort((a, b) => b.valorTotal - a.valorTotal),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 });
  }
}
