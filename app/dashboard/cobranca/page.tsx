'use client';

import { useEffect, useState } from 'react';
import { formatBRL, formatBRLK } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';

interface CobrancaItem {
  bkn: string;
  loja: string;
  osc: string | null;
  categoria: string;
  status: string | null;
  valor: number | null;
  isManeng: boolean;
}

export default function CobrancaPage() {
  const [cobranca, setCobranca] = useState<CobrancaItem[]>([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetch('/api/dados/cobranca')
      .then(r => r.json())
      .then(d => setCobranca(d.cobranca || []));
  }, []);

  const filtered = cobranca.filter(c => {
    if (filtro === 'Em Maneng' && !c.isManeng) return false;
    if (filtro === 'Não localizado' && c.isManeng) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return c.bkn.includes(q) || c.loja.toLowerCase().includes(q) || (c.osc || '').includes(q);
    }
    return true;
  });

  const total = filtered.length;
  const valorTotal = filtered.reduce((s, c) => s + (c.valor || 0), 0);
  const manengCount = filtered.filter(c => c.isManeng).length;
  const nlocalCount = filtered.filter(c => !c.isManeng).length;

  return (
    <div className="space-y-4">
      <div className="bg-zamp-green-bg border border-zamp-green rounded-lg p-3 text-xs text-zamp-green">
        ✅ <strong>OSCs para cobrança imediata</strong> · Executadas e aguardando faturamento. Assim que Ariba liberar, viram nota fiscal.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <MetricCard label="OSCs prontas" value={String(total)} color="green" />
        <MetricCard label="Valor disponível" value={formatBRLK(valorTotal)} color="green" />
        <MetricCard label="Em Maneng" value={String(manengCount)} sub="executado/validado" color="amber" />
        <MetricCard label="Não localizado" value={String(nlocalCount)} sub="na Maneng" color="red" />
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
        <div className="p-2.5 border-b border-zamp-border flex flex-wrap gap-2 items-center">
          <input 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar BKN, loja ou OSC..."
            className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
          />
          <div className="flex gap-1 flex-wrap">
            {['TODOS', 'Em Maneng', 'Não localizado'].map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                  filtro === f ? 'bg-zamp-accent border-zamp-accent text-white' : 'border-zamp-border2 text-zamp-text3'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zamp-border bg-zamp-bg3">
              {['BKN', 'Loja', 'OSC #', 'Categoria', 'Status', 'Valor', '⏱ Atraso'].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-medium text-zamp-text3 uppercase tracking-wider font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="border-b border-zamp-border hover:bg-zamp-bg3 transition-colors">
                <td className="px-2.5 py-2 font-mono text-zamp-accent">{c.bkn}</td>
                <td className="px-2.5 py-2 text-zamp-text truncate max-w-[200px]" title={c.loja}>{c.loja}</td>
                <td className="px-2.5 py-2 font-mono">{c.osc}</td>
                <td className="px-2.5 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                    c.isManeng ? 'bg-zamp-amber-bg border-zamp-amber text-zamp-amber' : 'bg-zamp-purple-bg border-zamp-purple text-zamp-purple'
                  }`}>
                    {c.isManeng ? 'Em Maneng' : 'Não localizado'}
                  </span>
                </td>
                <td className="px-2.5 py-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-green-bg border-zamp-green text-zamp-green">
                    {c.status}
                  </span>
                </td>
                <td className="px-2.5 py-2 font-mono text-zamp-green font-semibold">{formatBRL(c.valor || 0)}</td>
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
