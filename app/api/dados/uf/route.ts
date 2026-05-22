import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lojas = await prisma.loja.findMany({
      include: {
        chamados: { include: { oscs: true } },
        preventivas: { where: { status: 'PENDENTE' } },
      },
    });

    const ufMap = new Map();
    for (const loja of lojas) {
      const uf = loja.uf || '-';
      if (!ufMap.has(uf)) {
        ufMap.set(uf, { uf, count: 0, valorTotal: 0, valorMaterial: 0, prevCount: 0, prevValor: 0 });
      }
      const rec = ufMap.get(uf);
      const chamadosAbertos = loja.chamados.filter(c => c.status !== 'CONCLUIDO');
      rec.count += chamadosAbertos.length;
      rec.valorTotal += chamadosAbertos.reduce((s, c) => s + (c.valorProposta || 0), 0);
      rec.valorMaterial += chamadosAbertos.reduce((s, c) => s + c.oscs.reduce((os, o) => os + (o.valor || 0), 0), 0);
      rec.prevCount += loja.preventivas.length;
      rec.prevValor += loja.preventivas.reduce((s, p) => s + (p.valorTotal || 0), 0);
    }

    const corretivas = Array.from(ufMap.values())
      .filter(u => u.count > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);

    const preventivas = Array.from(ufMap.values())
      .filter(u => u.prevCount > 0)
      .sort((a, b) => b.prevValor - a.prevValor);

    return NextResponse.json({ corretivas, preventivas });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar UF' }, { status: 500 });
  }
}
