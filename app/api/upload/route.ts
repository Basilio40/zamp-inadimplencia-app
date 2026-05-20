import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
    
    const results: any = {};
    
    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false }) as any[][];
      
      const nameUpper = sheetName.toUpperCase();
      
      if (nameUpper.includes('CHAMADO')) {
        results.chamados = await importChamados(json);
      } else if (nameUpper.includes('PREVENTIVA')) {
        results.preventivas = await importPreventivas(json, sheetName);
      } else if (nameUpper.includes('ART')) {
        results.arts = await importArts(json);
      } else if (nameUpper.includes('BASE') || nameUpper.includes('LOJA')) {
        results.lojas = await importLojas(json);
      }
    }

    await prisma.upload.create({
      data: { nomeArquivo: file.name, tipo: 'GESTAO', status: 'SUCESSO', linhasProcessadas: 100 },
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function findHeaderRow(json: any[][]): number {
  for (let i = 0; i < Math.min(10, json.length); i++) {
    const row = json[i];
    if (!Array.isArray(row)) continue;
    const str = row.map(c => String(c || '').toUpperCase()).join(' ');
    if (str.includes('CLIENTE') || str.includes('UNIDADE') || str.includes('LOJA') || str.includes('BKN') || str.includes('CHAMADO')) return i;
  }
  return 0;
}

function parseMoney(v: any): number {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const s = String(v).replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseBKN(v: any): string {
  if (!v) return '';
  return String(v).replace(/[^0-9]/g, '');
}

async function importChamados(json: any[][]) {
  const hr = findHeaderRow(json);
  const headers = json[hr] || [];
  const rows = json.slice(hr + 1).filter(r => r.some(c => c !== ''));
  
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => { if (h) colMap[String(h).toUpperCase().trim()] = i; });
  
  const getVal = (row: any[], keys: string[]) => {
    for (const k of keys) { const idx = colMap[k]; if (idx !== undefined && row[idx] !== undefined && row[idx] !== '') return row[idx]; }
    return '';
  };

  let count = 0;
  for (const r of rows) {
    const unidade = String(getVal(r, ['UNIDADE', 'LOJA', 'RESTAURANTE']) || '').trim();
    const bkn = parseBKN(getVal(r, ['BKN', 'PDA', 'NºCHAMADO']));
    const status = String(getVal(r, ['STATUS', 'STATUS.1']) || 'PENDENTE').trim();
    const valor = parseMoney(getVal(r, ['VALOR', 'VALOR TOTAL', 'TOTAL']));
    const uf = String(getVal(r, ['UF', 'ESTADO']) || 'SP').trim();
    
    if (!bkn && !unidade) continue;
    
    let loja = await prisma.loja.findFirst({ where: { bkn: bkn || undefined } });
    if (!loja) {
      loja = await prisma.loja.create({ data: { bkn: bkn || `IMP-${Date.now()}`, nome: unidade || 'Sem nome', uf, cliente: 'IMPORTADO' } });
    }
    
    await prisma.chamado.create({
      data: { lojaId: loja.id, numeroChamado: bkn, pda: bkn, status, valorProposta: valor, mes: 'IMPORTADO' },
    });
    count++;
  }
  return count;
}

async function importPreventivas(json: any[][], sheetName: string) {
  const hr = findHeaderRow(json);
  const headers = json[hr] || [];
  const rows = json.slice(hr + 1).filter(r => r.some(c => c !== ''));
  
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => { if (h) colMap[String(h).toUpperCase().trim()] = i; });
  
  const getVal = (row: any[], keys: string[]) => {
    for (const k of keys) { const idx = colMap[k]; if (idx !== undefined && row[idx] !== undefined && row[idx] !== '') return row[idx]; }
    return '';
  };

  const mes = sheetName.toUpperCase().replace(/PREVENTIVA\s*/i, '').replace(/\s*-?\s*2026/i, '').trim();
  let count = 0;
  
  for (const r of rows) {
    const unidade = String(getVal(r, ['UNIDADE', 'LOJA', 'RESTAURANTE']) || '').trim();
    const uf = String(getVal(r, ['UF', 'ESTADO']) || '').trim();
    const escopo = String(getVal(r, ['ESCOPO', 'TIPO DE MANUTENÇÃO', 'TIPO DE MANUTENCAO']) || 'FRIO').trim();
    const valFrio = parseMoney(getVal(r, ['FRIO', 'VALOR FRIO']));
    const valAr = parseMoney(getVal(r, ['AR', 'VALOR AR']));
    
    if (!unidade) continue;
    
    let loja = await prisma.loja.findFirst({ where: { nome: { contains: unidade } } });
    if (!loja) {
      loja = await prisma.loja.create({ data: { bkn: `PREV-${Date.now()}-${count}`, nome: unidade, uf, escopo: escopo.toUpperCase(), cliente: 'BK' } });
    }
    
    const total = valFrio + valAr || (escopo.includes('FRIO/AR') ? 1525 : escopo.includes('FRIO') ? 800 : 725);
    await prisma.preventiva.create({
      data: { lojaId: loja.id, mesRef: mes || 'MARÇO', ano: 2026, tipoManutencao: 'AR_CONDICIONADO', status: 'PENDENTE', valorFrio: valFrio, valorAr: valAr, valorTotal: total },
    });
    count++;
  }
  return count;
}

async function importArts(json: any[][]) {
  return 0;
}

async function importLojas(json: any[][]) {
  return 0;
}
