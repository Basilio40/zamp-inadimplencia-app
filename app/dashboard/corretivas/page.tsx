'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { formatBRL, formatBRLK } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';

interface CorretivaItem {
  bkn: string;
  cnpj: string;
  loja: string;
  uf: string;
  oscs: number;
  valorTotal: number;
  materialParado: number;
  supervisor: string;
  statusFat: string;
  nf: string;
}

export default function CorretivasPage() {
  const [corretivas, setCorretivas] = useState<CorretivaItem[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [ufFiltro, setUfFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetch('/api/dados/corretivas')
      .then(r => r.json())
      .then(d => {
        setCorretivas(d.corretivas || []);
        const allUfs = [...new Set((d.corretivas || []).map((c: CorretivaItem) => c.uf).filter(Boolean))].sort();
        setUfs(allUfs);
      });
  }, []);

  const filtered = corretivas.filter(c => {
    if (ufFiltro && c.uf !== ufFiltro) return false;
    if (statusFiltro !== 'TODOS' && c.statusFat !== statusFiltro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return c.bkn.includes(q) || c.loja.toLowerCase().includes(q) || c.uf.toLowerCase().includes(q);
    }
    return true;
  });

  const totalLojas = filtered.length;
  const totalOscs = filtered.reduce((s, c) => s + c.oscs, 0);
  const totalValor = filtered.reduce((s, c) => s + c.valorTotal, 0);
  const totalMat = filtered.reduce((s, c) => s + c.materialParado, 0);
  const maxRow = filtered.length ? filtered.reduce((a, b) => a.valorTotal > b.valorTotal ? a : b) : null;
  const media = totalLojas ? totalValor / totalLojas : 0;

  async function cycleStatus(bkn: string, current: string) {
    const cycle = ['PENDENTE', 'PEDIDO RECEBIDO', 'FATURADO'];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const loja = corretivas.find(c => c.bkn === bkn);
    if (!loja) return;
    
    await fetch('/api/faturamento', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lojaId: 0, tipo: 'CORRETIVA', status: next }),
    });
    
    setCorretivas(prev => prev.map(c => c.bkn === bkn ? { ...c, statusFat: next } : c));
  }

  return (
    <div className="space-y-4">
      <div className="bg-zamp-blue-bg border border-zamp-blue rounded-lg p-3 text-xs text-zamp-blue">
        📅 <strong>Regra de Ciclo Bimestral (+60 dias):</strong> Após pagamento confirmado (FATURADO), a loja só pode receber nova manutenção preventiva após 60 dias. O painel indica automaticamente a data de liberação do próximo ciclo.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <MetricCard label="Lojas inadimp." value={String(totalLojas)} sub="corretivas" color="red" />
        <MetricCard label="OSCs pendentes" value={String(totalOscs)} sub="total" color="red" />
        <MetricCard label="Valor total" value={formatBRLK(totalValor)} color="red" />
        <MetricCard label="Mat. desembolsado" value={formatBRLK(totalMat)} color="purple" />
        <MetricCard label="Maior débito" value={maxRow ? formatBRLK(maxRow.valorTotal) : '—'} sub={maxRow ? `BKN ${maxRow.bkn}` : '—'} color="amber" />
        <MetricCard label="Média por loja" value={formatBRLK(media)} color="amber" />
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
        <div className="p-2.5 border-b border-zamp-border flex flex-wrap gap-2 items-center">
          <input 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar BKN, loja ou UF..."
            className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
          />
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setStatusFiltro('TODOS')} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${statusFiltro==='TODOS'?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>TODOS</button>
            <button onClick={() => setStatusFiltro('PENDENTE')} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${statusFiltro==='PENDENTE'?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>⚠ Pendente</button>
            <button onClick={() => setStatusFiltro('PEDIDO RECEBIDO')} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${statusFiltro==='PEDIDO RECEBIDO'?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>📨 Ped. Recebido</button>
            <button onClick={() => setStatusFiltro('FATURADO')} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${statusFiltro==='FATURADO'?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>✅ Faturado</button>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setUfFiltro('')} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${!ufFiltro?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>TODOS</button>
            {ufs.map(u => (
              <button key={u} onClick={() => setUfFiltro(u)} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${ufFiltro===u?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>{u}</button>
            ))}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zamp-border bg-zamp-bg3">
              {['BKN', 'CNPJ', 'Loja', 'UF', 'OSCs', 'Valor Total', 'Mat. Parado', 'Supervisor', 'Status Fat.', 'NF', '⏱ Atraso'].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-medium text-zamp-text3 uppercase tracking-wider font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="border-b border-zamp-border hover:bg-zamp-bg3 transition-colors">
                <td className="px-2.5 py-2 font-mono text-zamp-accent">{c.bkn}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-text2 text-[10px]">{c.cnpj}</td>
                <td className="px-2.5 py-2 text-zamp-text truncate max-w-[200px]" title={c.loja}>{c.loja}</td>
                <td className="px-2.5 py-2 text-zamp-text2">{c.uf}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-amber">{c.oscs}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-red font-semibold">{formatBRL(c.valorTotal)}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-purple">{formatBRL(c.materialParado)}</td>
                <td className="px-2.5 py-2 text-[11px] text-zamp-text2">{c.supervisor}</td>
                <td className="px-2.5 py-2">
                  <button onClick={() => cycleStatus(c.bkn, c.statusFat)} className="cursor-pointer">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                      c.statusFat === 'FATURADO' ? 'bg-zamp-green-bg border-zamp-green text-zamp-green' :
                      c.statusFat === 'PEDIDO RECEBIDO' ? 'bg-zamp-blue-bg border-zamp-blue text-zamp-blue' :
                      'bg-zamp-red-bg border-zamp-red-border text-zamp-red'
                    }`}>
                      {c.statusFat === 'FATURADO' ? '✅ FATURADO' : c.statusFat === 'PEDIDO RECEBIDO' ? '📨 PED. RECEBIDO' : '⚠ PENDENTE'}
                    </span>
                    <span className="text-[9px] text-zamp-text3 ml-1">✎</span>
                  </button>
                </td>
                <td className="px-2.5 py-2 font-mono text-[11px] text-zamp-text3">
                  {c.nf || '—'} <span className="text-[9px] text-zamp-text3 ml-0.5">✎</span>
                </td>
                <td className="px-2.5 py-2">
                  <span className="bg-zamp-red-bg border border-zamp-red-border text-zamp-red text-[10px] px-2 py-0.5 rounded font-mono">🔴 86d</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
