import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const { lojaId, tipo, status, nfNumero } = await req.json();

    let faturamento = await prisma.faturamento.findFirst({
      where: { lojaId, tipo },
    });

    if (!faturamento) {
      faturamento = await prisma.faturamento.create({
        data: { lojaId, tipo, status: status || 'PENDENTE' },
      });
    }

    const updateData: any = { status };
    if (nfNumero !== undefined) updateData.nfNumero = nfNumero;
    if (status === 'FATURADO') {
      updateData.dataPagamento = new Date();
      updateData.proximoCiclo = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    } else if (status === 'PENDENTE') {
      updateData.dataPagamento = null;
      updateData.proximoCiclo = null;
    }

    const updated = await prisma.faturamento.update({
      where: { id: faturamento.id },
      data: updateData,
    });

    await prisma.historico.create({
      data: {
        tabelaAfetada: 'Faturamento',
        registroId: updated.id,
        campo: 'status',
        valorAntigo: faturamento.status,
        valorNovo: status,
        tipoAcao: 'EDIT',
      },
    });

    return NextResponse.json({ success: true, faturamento: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar faturamento' }, { status: 500 });
  }
}
