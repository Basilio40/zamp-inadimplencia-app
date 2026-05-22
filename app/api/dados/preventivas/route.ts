import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uf = searchParams.get('uf') || '';
    const status = searchParams.get('status') || 'TODOS';
    const mes = searchParams.get('mes') || 'TODOS';
    const busca = searchParams.get('busca') || '';

    const where: any = {};
    if (status !== 'TODOS') where.status = status;
    if (mes !== 'TODOS') where.mesRef = mes;

    const preventivas = await prisma.preventiva.findMany({
      where,
      include: { loja: true },
    });

    const filtered = preventivas
      .filter(p => {
        if (uf && p.loja?.uf !== uf) return false;
        if (!busca) return true;
        const q = busca.toLowerCase();
        return (p.loja?.nome || '').toLowerCase().includes(q) ||
               (p.loja?.uf || '').toLowerCase().includes(q);
      })
      .map(p => ({
        id: p.id,
        loja: p.loja?.nome || '-',
        bkn: p.loja?.bkn || '-',
        uf: p.loja?.uf || '-',
        escopo: p.loja?.escopo || 'FRIO',
        mesRef: p.mesRef,
        valorFrio: p.valorFrio,
        valorAr: p.valorAr,
        valorTotal: p.valorTotal,
        status: p.status,
        nfNumero: p.nfNumero,
        dataPagamento: p.dataPagamento,
        proximoCiclo: p.proximoCiclo,
      }));

    return NextResponse.json({ preventivas: filtered });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar preventivas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bkn, uf, nome, escopo, mesRef, valorFrio, valorAr, status, nfNumero } = body;

    let loja = await prisma.loja.findFirst({ where: { bkn } });
    if (!loja) {
      loja = await prisma.loja.create({
        data: { bkn, nome, uf, escopo: escopo.toUpperCase(), cliente: 'BK' },
      });
    }

    const total = (valorFrio || 0) + (valorAr || 0);
    const preventiva = await prisma.preventiva.create({
      data: {
        lojaId: loja.id,
        mesRef: mesRef || 'MARÇO',
        ano: 2026,
        tipoManutencao: 'AR_CONDICIONADO',
        periodicidade: 'MENSAL',
        status: status || 'PENDENTE',
        valorFrio: valorFrio || 0,
        valorAr: valorAr || 0,
        valorTotal: total || (escopo === 'FRIO/AR' ? 1525 : escopo === 'FRIO' ? 800 : 725),
        nfNumero,
      },
    });

    return NextResponse.json({ success: true, preventiva });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar preventiva' }, { status: 500 });
  }
}
