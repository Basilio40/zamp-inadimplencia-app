'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { formatBRL, formatBRLK } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';

interface BloqueioItem {
  bkn: string;
  cnpj: string;
  loja: string;
  uf: string;
  corrVal: number;
  prevVal: number;
  tipo: 'CORRETIVA' | 'PREVENTIVA' | 'AMBAS';
}

export default function BloqueioPage() {
  const [bloqueio, setBloqueio] = useState<BloqueioItem[]>([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [buscaBkn, setBuscaBkn] = useState('');

  useEffect(() => {
    fetch('/api/dados/bloqueio')
      .then(r => r.json())
      .then(d => setBloqueio(d.bloqueio || []));
  }, []);

  const filtered = bloqueio.filter(b => {
    if (filtro !== 'TODOS' && b.tipo !== filtro) return false;
    if (buscaBkn && !b.bkn.toLowerCase().includes(buscaBkn.toLowerCase()) && !b.loja.toLowerCase().includes(buscaBkn.toLowerCase())) return false;
    if (busca && !b.loja.toLowerCase().includes(busca.toLowerCase()) && !b.uf.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const corrCount = filtered.filter(b => b.tipo === 'CORRETIVA').length;
  const prevCount = filtered.filter(b => b.tipo === 'PREVENTIVA').length;
  const ambasCount = filtered.filter(b => b.tipo === 'AMBAS').length;
  const corrVal = filtered.filter(b => b.tipo === 'CORRETIVA' || b.tipo === 'AMBAS').reduce((s, b) => s + b.corrVal, 0);
  const prevVal = filtered.filter(b => b.tipo === 'PREVENTIVA' || b.tipo === 'AMBAS').reduce((s, b) => s + b.prevVal, 0);

  return (
    <div className="space-y-4">
      <div className="bg-zamp-red-bg border border-zamp-red-border rounded-lg p-3 text-xs text-zamp-red">
        ⛔ <strong>Lista de bloqueio</strong> — Lojas com corretivas em aberto + preventivas pendentes. Nenhum novo atendimento até regularização do pagamento. <strong>Regra de ciclo:</strong> próxima manutenção só liberada 60 dias após pagamento confirmado.
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border2 rounded-xl p-3 flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-mono text-zamp-text3 whitespace-nowrap">🔍 BUSCA BKN</span>
        <input 
          value={buscaBkn} 
          onChange={e => setBuscaBkn(e.target.value)}
          placeholder="Digite o BKN ou nome da loja..."
          className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
        />
        <span className="text-[11px] font-mono text-zamp-text3">
          {buscaBkn ? <span className="text-zamp-amber font-semibold">{filtered.length} resultado(s)</span> : 'Mostrando todos os registros'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <MetricCard label="Total p/ bloquear" value={String(filtered.length)} sub="lojas" color="red" />
        <MetricCard label="Só corretivas" value={String(corrCount)} sub={formatBRLK(corrVal)} color="red" />
        <MetricCard label="Só preventivas" value={String(prevCount)} sub={formatBRLK(prevVal)} color="amber" />
        <MetricCard label="Ambas" value={String(ambasCount)} sub="lojas em corretiva E preventiva" color="red" />
        <MetricCard label="Total valor" value={formatBRLK(corrVal + prevVal)} sub="em aberto" color="red" />
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-2.5 border-b border-zamp-border flex-wrap">
          <input 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            placeholder="Filtrar por loja, UF..."
            className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
          />
          <div className="flex gap-1 flex-wrap">
            {['TODOS', 'CORRETIVA', 'PREVENTIVA', 'AMBAS'].map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all ${
                  filtro === f 
                    ? 'bg-zamp-accent border-zamp-accent text-white' 
                    : 'bg-transparent border-zamp-border2 text-zamp-text3 hover:text-zamp-text'
                }`}
              >
                {f === 'TODOS' ? 'TODOS' : f === 'CORRETIVA' ? '🔧 Corretiva' : f === 'PREVENTIVA' ? '🛡 Preventiva' : '⚡ Ambas'}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zamp-border bg-zamp-bg3">
              {['BKN', 'CNPJ', 'Loja', 'UF', 'Tipo', 'Corretiva R$', 'Preventiva R$', 'Total R$', '⏱ Atraso'].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-medium text-zamp-text3 uppercase tracking-wider font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={i} className="border-b border-zamp-border hover:bg-zamp-bg3 transition-colors">
                <td className="px-2.5 py-2 font-mono text-zamp-accent">{b.bkn}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-text2 text-[10px]">{b.cnpj}</td>
                <td className="px-2.5 py-2 text-zamp-text truncate max-w-[200px]" title={b.loja}>{b.loja}</td>
                <td className="px-2.5 py-2 text-zamp-text2">{b.uf}</td>
                <td className="px-2.5 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                    b.tipo === 'AMBAS' ? 'bg-zamp-amber-bg border-zamp-amber text-zamp-amber' :
                    b.tipo === 'CORRETIVA' ? 'bg-zamp-red-bg border-zamp-red-border text-zamp-red' :
                    'bg-zamp-green-bg border-zamp-green text-zamp-green'
                  }`}>
                    {b.tipo === 'AMBAS' ? '⚡ AMBAS' : b.tipo === 'CORRETIVA' ? '🔧 CORRETIVA' : '🛡 PREV.'}
                  </span>
                </td>
                <td className="px-2.5 py-2 font-mono text-zamp-red">{b.corrVal > 0 ? formatBRL(b.corrVal) : '-'}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-amber">{b.prevVal > 0 ? formatBRL(b.prevVal) : '-'}</td>
                <td className="px-2.5 py-2 font-mono font-semibold text-zamp-red">{formatBRL(b.corrVal + b.prevVal)}</td>
                <td className="px-2.5 py-2">
                  <span className="bg-zamp-red-bg border border-zamp-red-border text-zamp-red text-[10px] px-2 py-0.5 rounded font-mono">🔴 86d atraso</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
