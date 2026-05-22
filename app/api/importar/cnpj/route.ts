import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array', cellDates: true });

    let totalAtualizados = 0;
    let totalNaoEncontrados = 0;
    const erros: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false }) as any[][];

      if (json.length === 0) continue;

      const { headerRow, bknIdx, cnpjIdx } = detectColumns(json);

      if (bknIdx === -1 || cnpjIdx === -1) {
        erros.push(`Aba "${sheetName}": não detectou colunas BKN e CNPJ`);
        continue;
      }

      for (let i = headerRow + 1; i < json.length; i++) {
        const row = json[i];
        if (!Array.isArray(row) || row.every(c => c === '')) continue;

        const bknRaw = row[bknIdx];
        const cnpjRaw = row[cnpjIdx];

        const bkn = parseBKN(bknRaw);
        const cnpj = formatCNPJ(cnpjRaw);

        if (!bkn || !cnpj) continue;

        const loja = await prisma.loja.findFirst({ where: { bkn } });
        if (loja) {
          await prisma.loja.update({
            where: { id: loja.id },
            data: { cnpj },
          });
          totalAtualizados++;
        } else {
          totalNaoEncontrados++;
        }
      }
    }

    await prisma.upload.create({
      data: { nomeArquivo: file.name, tipo: 'CNPJ', status: 'SUCESSO', linhasProcessadas: totalAtualizados },
    });

    return NextResponse.json({
      success: true,
      atualizados: totalAtualizados,
      naoEncontrados: totalNaoEncontrados,
      erros: erros.length > 0 ? erros : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function detectColumns(json: any[][]) {
  let headerRow = -1;
  let bknIdx = -1;
  let cnpjIdx = -1;

  const bknNames = ['BKN', 'PDA', 'CÓDIGO CLIENTE', 'CODIGO CLIENTE', 'COD CLIENTE', 'CÓD CLIENTE', 'CÓDIGO', 'CÓDIGO LOJA', 'CODIGO LOJA', 'CÓD LOJA', 'COD LOJA', 'CÓDIGO BK', 'CODIGO BK', 'CLIENTE COD', 'CÓDIGO CLIENTE BK', 'CODIGO CLIENTE BK', 'ID LOJA', 'ID CLIENTE', 'NÚMERO LOJA', 'NUMERO LOJA', 'NUM LOJA', 'LOJA COD'];
  const cnpjNames = ['CNPJ', 'C.N.P.J.', 'CNPJ LOJA', 'CNPJ CLIENTE', 'CNPJ DA LOJA', 'CNPJ ESTABELECIMENTO', 'DOC', 'DOCUMENTO', 'CNPJ/CPF', 'CPF/CNPJ'];

  for (let i = 0; i < Math.min(15, json.length); i++) {
    const row = json[i];
    if (!Array.isArray(row)) continue;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toUpperCase().trim().replace(/\s+/g, ' ').replace(/\./g, '');
      const normalized = cell.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (bknIdx === -1 && bknNames.some(name => normalized === name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
        bknIdx = j;
      }
      if (cnpjIdx === -1 && cnpjNames.some(name => normalized === name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) {
        cnpjIdx = j;
      }
    }

    if (bknIdx !== -1 && cnpjIdx !== -1) {
      headerRow = i;
      break;
    }
  }

  // Se não achou por nome exato, tenta busca parcial
  if (bknIdx === -1 || cnpjIdx === -1) {
    for (let i = 0; i < Math.min(15, json.length); i++) {
      const row = json[i];
      if (!Array.isArray(row)) continue;

      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toUpperCase().trim();
        const normalized = cell.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (bknIdx === -1 && (normalized.includes('BKN') || normalized.includes('PDA') || normalized.includes('CODIGO') || normalized.includes('CODIGO CLIENTE'))) {
          bknIdx = j;
        }
        if (cnpjIdx === -1 && normalized.includes('CNPJ')) {
          cnpjIdx = j;
        }
      }

      if (bknIdx !== -1 && cnpjIdx !== -1) {
        headerRow = i;
        break;
      }
    }
  }

  return { headerRow, bknIdx, cnpjIdx };
}

function parseBKN(v: any): string {
  if (!v) return '';
  return String(v).replace(/[^0-9]/g, '');
}

function formatCNPJ(v: any): string {
  if (!v) return '';
  const nums = String(v).replace(/\D/g, '');
  if (nums.length !== 14) return nums; // retorna como está se não tiver 14 dígitos
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12, 14)}`;
}
