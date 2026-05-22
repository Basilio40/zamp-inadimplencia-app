'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';

interface HistoricoItem {
  id: number;
  tabelaAfetada: string | null;
  campo: string | null;
  valorAntigo: string | null;
  valorNovo: string | null;
  tipoAcao: string | null;
  timestamp: string;
}

export default function HistoricoPage() {
  const [historicos, setHistoricos] = useState<HistoricoItem[]>([]);

  useEffect(() => {
    fetch('/api/dados/historico')
      .then(r => r.json())
      .then(d => setHistoricos(d.historicos || []));
  }, []);

  function tipoColor(tipo: string | null) {
    if (tipo === 'add') return 'bg-zamp-green';
    if (tipo === 'del') return 'bg-zamp-red';
    if (tipo === 'import') return 'bg-zamp-purple';
    return 'bg-zamp-blue';
  }

  function exportarHistorico() {
    const blob = new Blob([JSON.stringify(historicos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_zamp_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function limparHistorico() {
    if (!confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) return;
    try {
      const res = await fetch('/api/historico/limpar', { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao limpar');
      setHistoricos([]);
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-zamp-bg p-6">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="bg-zamp-blue-bg border border-zamp-blue rounded-lg p-3 text-xs text-zamp-blue">
          📜 <strong>Histórico de atualizações</strong> — Todas as alterações de status, NF e adições de OS registradas com timestamp.
        </div>

        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-zamp-border flex justify-between items-center flex-wrap gap-3">
            <span className="text-[11px] font-mono text-zamp-text3">{historicos.length} entradas</span>
            <div className="flex gap-2">
              <button
                onClick={exportarHistorico}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-zamp-text2 border border-zamp-border2 hover:bg-zamp-bg3 hover:text-zamp-text transition-colors"
              >
                <Download size={12} /> Exportar histórico
              </button>
              <button
                onClick={limparHistorico}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-zamp-red bg-zamp-red-bg border border-zamp-red-border hover:bg-zamp-red/10 transition-colors"
              >
                <Trash2 size={12} /> Limpar
              </button>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {historicos.length === 0 ? (
              <div className="text-center py-8 text-xs text-zamp-text3">Nenhuma alteração registrada ainda</div>
            ) : (
              <div className="divide-y divide-zamp-border">
                {historicos.map(h => (
                  <div key={h.id} className="flex gap-3 px-3 py-2 text-xs items-start">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${tipoColor(h.tipoAcao)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-zamp-text2 leading-relaxed">
                        [{h.tabelaAfetada}] {h.campo}: &quot;{h.valorAntigo}&quot; → &quot;{h.valorNovo}&quot;
                      </div>
                      <div className="text-[10px] text-zamp-text3 font-mono mt-0.5">{new Date(h.timestamp).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
