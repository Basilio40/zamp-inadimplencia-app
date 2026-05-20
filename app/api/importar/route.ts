import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.data || body;

    const results: Record<string, number> = {};

    if (Array.isArray(data.lojas) && data.lojas.length > 0) {
      let count = 0;
      for (const item of data.lojas) {
        const bkn = item.bkn || item.pda;
        const upsertData = {
          pda: item.pda || null,
          nome: item.nome || 'Sem nome',
          cliente: item.cliente || null,
          uf: item.uf || null,
          regional: item.regional || null,
          endereco: item.endereco || null,
          escopo: item.escopo || 'FRIO',
          supervisor: item.supervisor || null,
          pcm: item.pcm || null,
          ativo: item.ativo !== undefined ? item.ativo : true,
        };
        if (bkn) {
          await prisma.loja.upsert({
            where: { bkn },
            update: upsertData,
            create: { ...upsertData, bkn },
          });
        } else {
          await prisma.loja.create({ data: { ...upsertData, bkn: `IMP-${Date.now()}-${count}` } });
        }
        count++;
      }
      results.lojas = count;
    }

    if (Array.isArray(data.chamados) && data.chamados.length > 0) {
      let count = 0;
      for (const item of data.chamados) {
        let lojaId = item.lojaId;
        if (!lojaId && item.bkn) {
          const loja = await prisma.loja.findFirst({ where: { bkn: item.bkn } });
          if (loja) lojaId = loja.id;
        }
        if (!lojaId) continue;
        await prisma.chamado.create({
          data: {
            lojaId,
            numeroChamado: item.numeroChamado || item.pda || null,
            pda: item.pda || null,
            motivo: item.motivo || null,
            status: item.status || 'PENDENTE',
            dataAbertura: item.dataAbertura ? new Date(item.dataAbertura) : null,
            mes: item.mes || null,
            tecnico: item.tecnico || null,
            descricaoServico: item.descricaoServico || null,
            valorProposta: item.valorProposta || 0,
            oscOsbOsd: item.oscOsbOsd || null,
            statusEquipamento: item.statusEquipamento || null,
            observacoes: item.observacoes || null,
          },
        });
        count++;
      }
      results.chamados = count;
    }

    if (Array.isArray(data.oscs) && data.oscs.length > 0) {
      let count = 0;
      for (const item of data.oscs) {
        let lojaId = item.lojaId;
        if (!lojaId && item.bkn) {
          const loja = await prisma.loja.findFirst({ where: { bkn: item.bkn } });
          if (loja) lojaId = loja.id;
        }
        if (!lojaId) continue;
        await prisma.oSC.create({
          data: {
            lojaId,
            chamadoId: item.chamadoId || null,
            numeroOsc: item.numeroOsc || null,
            status: item.status || 'PENDENTE',
            valor: item.valor || 0,
            descricao: item.descricao || null,
            cobrancaImediata: item.cobrancaImediata || false,
          },
        });
        count++;
      }
      results.oscs = count;
    }

    if (Array.isArray(data.preventivas) && data.preventivas.length > 0) {
      let count = 0;
      for (const item of data.preventivas) {
        let lojaId = item.lojaId;
        if (!lojaId && item.bkn) {
          const loja = await prisma.loja.findFirst({ where: { bkn: item.bkn } });
          if (loja) lojaId = loja.id;
        }
        if (!lojaId) continue;
        await prisma.preventiva.create({
          data: {
            lojaId,
            mesRef: item.mesRef || null,
            ano: item.ano || 2026,
            tipoManutencao: item.tipoManutencao || 'AR_CONDICIONADO',
            periodicidade: item.periodicidade || 'MENSAL',
            dataInicio: item.dataInicio ? new Date(item.dataInicio) : null,
            dataTermino: item.dataTermino ? new Date(item.dataTermino) : null,
            status: item.status || 'PENDENTE',
            valorFrio: item.valorFrio || 0,
            valorAr: item.valorAr || 0,
            valorTotal: item.valorTotal || 0,
            pmocStatus: item.pmocStatus || null,
            artVencimento: item.artVencimento ? new Date(item.artVencimento) : null,
            artStatus: item.artStatus || null,
            nfNumero: item.nfNumero || null,
            dataPagamento: item.dataPagamento ? new Date(item.dataPagamento) : null,
            proximoCiclo: item.proximoCiclo ? new Date(item.proximoCiclo) : null,
          },
        });
        count++;
      }
      results.preventivas = count;
    }

    if (Array.isArray(data.arts) && data.arts.length > 0) {
      let count = 0;
      for (const item of data.arts) {
        let lojaId = item.lojaId;
        if (!lojaId && item.bkn) {
          const loja = await prisma.loja.findFirst({ where: { bkn: item.bkn } });
          if (loja) lojaId = loja.id;
        }
        if (!lojaId) continue;
        await prisma.aRT.create({
          data: {
            lojaId,
            osp: item.osp || null,
            valor: item.valor || 0,
            tipo: item.tipo || null,
            dataEmissao: item.dataEmissao ? new Date(item.dataEmissao) : null,
            vencimento: item.vencimento ? new Date(item.vencimento) : null,
            status: item.status || 'EM_DIA',
          },
        });
        count++;
      }
      results.arts = count;
    }

    if (Array.isArray(data.faturamentos) && data.faturamentos.length > 0) {
      let count = 0;
      for (const item of data.faturamentos) {
        let lojaId = item.lojaId;
        if (!lojaId && item.bkn) {
          const loja = await prisma.loja.findFirst({ where: { bkn: item.bkn } });
          if (loja) lojaId = loja.id;
        }
        if (!lojaId) continue;
        await prisma.faturamento.create({
          data: {
            lojaId,
            tipo: item.tipo || 'CORRETIVA',
            status: item.status || 'PENDENTE',
            nfNumero: item.nfNumero || null,
            dataPagamento: item.dataPagamento ? new Date(item.dataPagamento) : null,
            proximoCiclo: item.proximoCiclo ? new Date(item.proximoCiclo) : null,
            valor: item.valor || 0,
          },
        });
        count++;
      }
      results.faturamentos = count;
    }

    if (Array.isArray(data.historicos) && data.historicos.length > 0) {
      let count = 0;
      for (const item of data.historicos) {
        await prisma.historico.create({
          data: {
            usuarioId: item.usuarioId || null,
            tabelaAfetada: item.tabelaAfetada || null,
            registroId: item.registroId || null,
            campo: item.campo || null,
            valorAntigo: item.valorAntigo || null,
            valorNovo: item.valorNovo || null,
            tipoAcao: item.tipoAcao || 'IMPORT',
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          },
        });
        count++;
      }
      results.historicos = count;
    }

    const total = Object.values(results).reduce((a, b) => a + b, 0);
    return NextResponse.json({ success: true, results, message: `${total} registros importados.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
