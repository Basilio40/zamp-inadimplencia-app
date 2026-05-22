'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { formatBRL, formatBRLK } from '@/lib/utils';
import MetricCard from '@/components/MetricCard';

interface PreventivaItem {
  id: number;
  loja: string;
  bkn: string;
  uf: string;
  escopo: string;
  mesRef: string | null;
  valorFrio: number | null;
  valorAr: number | null;
  valorTotal: number | null;
  status: string | null;
  nfNumero: string | null;
  dataPagamento: string | null;
  proximoCiclo: string | null;
}

export default function PreventivasPage() {
  const [preventivas, setPreventivas] = useState<PreventivaItem[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [ufFiltro, setUfFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [mesFiltro, setMesFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const r = await fetch('/api/dados/preventivas');
    const d = await r.json();
    setPreventivas(d.preventivas || []);
    const allUfs = [...new Set((d.preventivas || []).map((p: PreventivaItem) => p.uf).filter(Boolean))].sort();
    setUfs(allUfs);
  }

  const filtered = preventivas.filter(p => {
    if (ufFiltro && p.uf !== ufFiltro) return false;
    if (statusFiltro !== 'TODOS' && p.status !== statusFiltro) return false;
    if (mesFiltro !== 'TODOS' && p.mesRef !== mesFiltro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return p.loja.toLowerCase().includes(q) || p.uf.toLowerCase().includes(q);
    }
    return true;
  });

  const total = filtered.length;
  const pends = filtered.filter(p => p.status === 'PENDENTE');
  const fats = filtered.filter(p => p.status === 'FATURADO');
  const pendValor = pends.reduce((s, p) => s + (p.valorTotal || 0), 0);
  const fatValor = fats.reduce((s, p) => s + (p.valorTotal || 0), 0);
  const taxa = total ? Math.round(fats.length / total * 100) : 0;

  function escopoBadge(esc: string) {
    if (esc.includes('FRIO/AR')) return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-purple-bg border-zamp-purple text-zamp-purple">FRIO/AR</span>;
    if (esc === 'FRIO') return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-blue-bg border-zamp-blue text-zamp-blue">FRIO</span>;
    return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-purple-bg border-zamp-purple text-zamp-purple">AR</span>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-zamp-blue-bg border border-zamp-blue rounded-lg p-3 text-xs text-zamp-blue">
        📅 <strong>Regra de Ciclo Bimestral (+60 dias):</strong> Após pagamento confirmado (FATURADO), a loja só pode receber nova manutenção preventiva após 60 dias. O painel indica automaticamente a data de liberação do próximo ciclo.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <MetricCard label="OSs abertas" value={String(total)} color="default" />
        <MetricCard label="Pendentes" value={String(pends.length)} sub={formatBRLK(pendValor)} color="red" />
        <MetricCard label="Faturadas" value={String(fats.length)} sub={formatBRLK(fatValor)} color="green" />
        <MetricCard label="Taxa faturamento" value={`${taxa}%`} sub="Fev foi 87%" color="amber" />
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 bg-zamp-green-bg border border-zamp-green text-zamp-green text-xs rounded font-mono hover:bg-opacity-20 transition-colors"
        >
          + Nova OS Preventiva
        </button>
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
        <div className="p-2.5 border-b border-zamp-border flex flex-wrap gap-2 items-center">
          <input 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar loja, UF ou escopo..."
            className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
          />
          <div className="flex gap-1 flex-wrap">
            {['TODOS', 'PENDENTE', 'PEDIDO RECEBIDO', 'FATURADO'].map(f => (
              <button key={f} onClick={() => setStatusFiltro(f)} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${statusFiltro===f?'bg-zamp-accent border-zamp-accent text-white':'border-zamp-border2 text-zamp-text3'}`}>
                {f==='TODOS'?'TODOS':f==='PENDENTE'?'⚠ Pendente':f==='PEDIDO RECEBIDO'?'📨 Ped. Recebido':'✅ Faturado'}
              </button>
            ))}
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
              {['Loja', 'UF', 'Escopo', 'Frio R$', 'AR R$', 'Total', 'Status', 'NF', '⏱ Atraso', 'Próx. Ciclo'].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-medium text-zamp-text3 uppercase tracking-wider font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} className="border-b border-zamp-border hover:bg-zamp-bg3 transition-colors">
                <td className="px-2.5 py-2 text-zamp-text truncate max-w-[200px]" title={p.loja}>{p.loja}</td>
                <td className="px-2.5 py-2 text-zamp-text2">{p.uf}</td>
                <td className="px-2.5 py-2">{escopoBadge(p.escopo)}</td>
                <td className="px-2.5 py-2 font-mono">{p.valorFrio ? `R$ ${p.valorFrio}` : '-'}</td>
                <td className="px-2.5 py-2 font-mono">{p.valorAr ? `R$ ${p.valorAr}` : '-'}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-red font-semibold">R$ {p.valorTotal}</td>
                <td className="px-2.5 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${
                    p.status === 'FATURADO' ? 'bg-zamp-green-bg border-zamp-green text-zamp-green' :
                    p.status === 'PEDIDO RECEBIDO' ? 'bg-zamp-blue-bg border-zamp-blue text-zamp-blue' :
                    'bg-zamp-red-bg border-zamp-red-border text-zamp-red'
                  }`}>
                    {p.status === 'FATURADO' ? '✅ FATURADO' : p.status === 'PEDIDO RECEBIDO' ? '📨 PED. RECEBIDO' : '⚠ PENDENTE'}
                  </span>
                </td>
                <td className="px-2.5 py-2 font-mono text-[11px] text-zamp-text3">{p.nfNumero || '—'}</td>
                <td className="px-2.5 py-2">
                  <span className="bg-zamp-red-bg border border-zamp-red-border text-zamp-red text-[10px] px-2 py-0.5 rounded font-mono">🔴 45d</span>
                </td>
                <td className="px-2.5 py-2">
                  {p.proximoCiclo ? (
                    <span className="bg-zamp-blue-bg border border-zamp-blue text-zamp-blue text-[10px] px-2 py-0.5 rounded font-mono">🔒 {p.proximoCiclo}</span>
                  ) : (
                    <span className="bg-zamp-red-bg border border-zamp-red-border text-zamp-red text-[10px] px-2 py-0.5 rounded font-mono">Bloqueado</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal simplificado */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zamp-bg2 border border-zamp-border2 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-sm font-semibold mb-4">+ Nova OS Preventiva</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = Object.fromEntries(new FormData(form));
              await fetch('/api/dados/preventivas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              setModalOpen(false);
              loadData();
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">BKN</label><input name="bkn" required className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono" /></div>
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">UF</label>
                  <select name="uf" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono">
                    {['SP','GO','MG','BA','PA','DF','PB','CE','RN','PE','RS','PR','MA','AL','SE'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Nome da Loja</label><input name="nome" required className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Escopo</label>
                  <select name="escopo" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono">
                    <option>FRIO</option><option>AR</option><option>FRIO/AR</option>
                  </select>
                </div>
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Mês ref.</label>
                  <select name="mesRef" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono">
                    {['FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Valor Frio R$</label><input name="valorFrio" type="number" defaultValue="800" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono" /></div>
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Valor AR R$</label><input name="valorAr" type="number" defaultValue="725" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Status Fat.</label>
                  <select name="status" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono">
                    <option>PENDENTE</option><option>FATURADO</option><option>PEDIDO RECEBIDO</option>
                  </select>
                </div>
                <div><label className="text-[10px] font-mono text-zamp-text3 uppercase">Nº NF</label><input name="nfNumero" className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zamp-border">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs text-zamp-text2 border border-zamp-border2 rounded hover:bg-zamp-bg3">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-xs bg-zamp-accent text-white rounded hover:bg-orange-700">Adicionar OS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
