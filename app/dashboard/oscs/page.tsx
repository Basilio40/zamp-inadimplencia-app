'use client';

import { useEffect, useState } from 'react';
import { formatBRL } from '@/lib/utils';

interface OSCItem {
  id: number;
  loja: { bkn: string | null; nome: string; uf: string | null };
  numeroOsc: string | null;
  status: string | null;
  valor: number | null;
  descricao: string | null;
}

export default function OSCsPage() {
  const [oscs, setOscs] = useState<OSCItem[]>([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetch('/api/dados/oscs')
      .then(r => r.json())
      .then(d => setOscs(d.oscs || []));
  }, []);

  const filtered = oscs.filter(o => {
    if (filtro !== 'TODOS' && o.status !== filtro) return false;
    if (busca) {
      const q = busca.toLowerCase();
      return (o.loja?.bkn || '').includes(q) || 
             (o.loja?.nome || '').toLowerCase().includes(q) ||
             (o.numeroOsc || '').includes(q) ||
             (o.descricao || '').toLowerCase().includes(q);
    }
    return true;
  });

  function statusBadge(status: string | null) {
    const s = (status || '').toUpperCase();
    if (s.includes('EXECUTADO')) return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-green-bg border-zamp-green text-zamp-green">EXECUTADO</span>;
    if (s.includes('FOLHA')) return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-amber-bg border-zamp-amber text-zamp-amber">FOLHA SERV.</span>;
    if (s.includes('MATERIAL')) return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-blue-bg border-zamp-blue text-zamp-blue">MAT. LIBERADO</span>;
    return <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono border bg-zamp-purple-bg border-zamp-purple text-zamp-purple">AG. SOLIC.</span>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-zamp-blue-bg border border-zamp-blue rounded-lg p-3 text-xs text-zamp-blue">
        📋 <strong>Detalhe Individual por OSC</strong> · Ordens de serviço corretivas em aberto. Clique em uma linha para ver detalhes.
      </div>

      <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
        <div className="p-2.5 border-b border-zamp-border flex flex-wrap gap-2 items-center">
          <input 
            value={busca} 
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar BKN, OSC, loja ou descrição..."
            className="flex-1 min-w-[200px] bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-1.5 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
          />
          <div className="flex gap-1 flex-wrap">
            {['TODOS', 'EXECUTADO', 'FOLHA DE SERVIÇO CRIADA', 'MATERIAL LIBERADO', 'AG. SOLICITAÇÃO SUP.'].map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
                  filtro === f ? 'bg-zamp-accent border-zamp-accent text-white' : 'border-zamp-border2 text-zamp-text3'
                }`}
              >
                {f === 'TODOS' ? 'TODOS' : f === 'EXECUTADO' ? 'Executado' : f === 'FOLHA DE SERVIÇO CRIADA' ? 'Folha Serv.' : f === 'MATERIAL LIBERADO' ? 'Mat. Liberado' : 'Ag. Solic.'}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zamp-border bg-zamp-bg3">
              {['BKN', 'Loja', 'UF', 'OSC #', 'Status', 'Valor', 'Descrição'].map(h => (
                <th key={h} className="px-2.5 py-2 text-left text-[10px] font-medium text-zamp-text3 uppercase tracking-wider font-mono whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={i} className="border-b border-zamp-border hover:bg-zamp-bg3 transition-colors">
                <td className="px-2.5 py-2 font-mono text-zamp-accent">{o.loja?.bkn || '-'}</td>
                <td className="px-2.5 py-2 text-zamp-text truncate max-w-[200px]" title={o.loja?.nome}>{o.loja?.nome}</td>
                <td className="px-2.5 py-2 text-zamp-text2">{o.loja?.uf}</td>
                <td className="px-2.5 py-2 font-mono">{o.numeroOsc}</td>
                <td className="px-2.5 py-2">{statusBadge(o.status)}</td>
                <td className="px-2.5 py-2 font-mono text-zamp-amber font-semibold">{formatBRL(o.valor || 0)}</td>
                <td className="px-2.5 py-2 text-[11px] text-zamp-text2 truncate max-w-[250px]" title={o.descricao || ''}>{o.descricao || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
