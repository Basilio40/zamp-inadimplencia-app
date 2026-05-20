'use client';

import { useEffect, useState } from 'react';
import { formatBRLK } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';

interface UFAgg {
  uf: string;
  count: number;
  valorTotal: number;
  valorMaterial: number;
  prevCount: number;
  prevValor: number;
}

export default function UFPage() {
  const [corretivas, setCorretivas] = useState<UFAgg[]>([]);
  const [preventivas, setPreventivas] = useState<UFAgg[]>([]);

  useEffect(() => {
    fetch('/api/dados/uf')
      .then(r => r.json())
      .then(d => {
        setCorretivas(d.corretivas || []);
        setPreventivas(d.preventivas || []);
      });
  }, []);

  const spData = corretivas.find(u => u.uf === 'SP');
  const spPct = spData && corretivas.length ? Math.round(spData.count / corretivas.reduce((s, u) => s + u.count, 0) * 100) : 0;

  const colors = ['#e24b4a', '#f9ab00', '#f9ab00', '#4285f4', '#4285f4', '#34a853', '#9c6fd6', '#00bcd4', '#ff9800', '#e91e63', '#673ab7', '#009688', '#3f51b5'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        <MetricCard label="UFs afetadas (corretivas)" value={String(corretivas.length)} color="red" />
        <MetricCard label="SP domina" value={`${spPct}%`} sub="das OSCs corretivas" color="default" />
        <MetricCard label="SP valor" value={spData ? formatBRLK(spData.valorTotal) : '—'} sub="do total" color="red" />
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">Distribuição geográfica — corretivas</h4>
          <span className="text-[11px] font-mono text-zamp-amber">{formatBRLK(corretivas.reduce((s, u) => s + u.valorTotal, 0))}</span>
        </div>
        <div className="space-y-2">
          {corretivas.map((u, i) => {
            const maxV = corretivas[0]?.valorTotal || 1;
            const w = Math.round(u.valorTotal / maxV * 100);
            return (
              <div key={u.uf} className="flex items-center gap-3">
                <div className="w-[140px] text-[11px] text-zamp-text2 font-mono truncate">{u.uf} ({u.count} OSCs)</div>
                <div className="flex-1 h-2.5 bg-zamp-bg3 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${w}%`, background: colors[i % colors.length] }} />
                </div>
                <div className="w-[80px] text-right text-[11px] font-mono text-zamp-text">{formatBRLK(u.valorTotal)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">UFs com pendências preventivas</h4>
          <span className="text-[11px] font-mono text-zamp-amber">{formatBRLK(preventivas.reduce((s, u) => s + u.prevValor, 0))}</span>
        </div>
        <div className="space-y-2">
          {preventivas.map((u, i) => {
            const maxV = preventivas[0]?.prevValor || 1;
            const w = Math.round(u.prevValor / maxV * 100);
            return (
              <div key={u.uf} className="flex items-center gap-3">
                <div className="w-[140px] text-[11px] text-zamp-text2 font-mono truncate">{u.uf} ({u.prevCount} lojas)</div>
                <div className="flex-1 h-2.5 bg-zamp-bg3 rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${w}%`, background: colors[i % colors.length] }} />
                </div>
                <div className="w-[80px] text-right text-[11px] font-mono text-zamp-text">{formatBRLK(u.prevValor)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
