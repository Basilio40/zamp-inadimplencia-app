'use client';

import { useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Download, Upload } from 'lucide-react';

const tabs = [
  { id: 'resumo', label: 'Resumo', href: '/dashboard' },
  { id: 'bloqueio', label: '🔴 Lista de Bloqueio', href: '/dashboard/bloqueio' },
  { id: 'corretivas', label: 'Corretivas', href: '/dashboard/corretivas' },
  { id: 'oscs', label: 'Detalhe OSCs', href: '/dashboard/oscs' },
  { id: 'cobranca', label: 'Cobrança Imediata', href: '/dashboard/cobranca' },
  { id: 'preventivas', label: 'Preventivas', href: '/dashboard/preventivas' },
  { id: 'uf', label: 'Por UF', href: '/dashboard/uf' },
  { id: 'importar', label: '📤 Importar', href: '/importar' },
  { id: 'historico', label: '📜 Histórico', href: '/historico' },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const importRef = useRef<HTMLInputElement>(null);

  async function exportarJSON() {
    try {
      const res = await fetch('/api/exportar');
      if (!res.ok) throw new Error('Erro ao exportar');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zamp_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Erro ao exportar: ' + e.message);
    }
  }

  async function importarJSON(file?: File) {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao importar');
      alert(`Importação concluída! ${result.message || ''}`);
      window.location.reload();
    } catch (e: any) {
      alert('Erro ao importar: ' + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-zamp-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zamp-bg2 border-b border-zamp-border px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zamp-accent rounded-md flex items-center justify-center font-mono font-bold text-sm text-white">
            BK
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zamp-text">Painel de Inadimplência ZAMP</h1>
            <p className="text-[11px] text-zamp-text3 font-mono">Corretivas + Preventivas · Gestão Completa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportarJSON()}
            className="flex items-center gap-1.5 text-[11px] font-mono text-zamp-green bg-zamp-green-bg border border-zamp-green-border rounded-full px-3 py-1 hover:bg-zamp-green/10 transition-colors"
            title="Exportar dados como JSON"
          >
            <Download size={12} /> Exportar JSON
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-mono text-zamp-blue bg-zamp-blue-bg border border-zamp-blue-border rounded-full px-3 py-1 hover:bg-zamp-blue/10 transition-colors"
            title="Importar dados de JSON"
          >
            <Upload size={12} /> Importar JSON
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={e => importarJSON(e.target.files?.[0])} />

          <span className="text-[11px] font-mono text-zamp-text3 bg-zamp-bg3 border border-zamp-border rounded-full px-3 py-1">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </span>
          {session?.user && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zamp-text2 flex items-center gap-1">
                <User size={12} /> {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-zamp-text3 hover:text-zamp-text transition-colors"
                title="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-0.5 px-6 pt-3 bg-zamp-bg2 border-b border-zamp-border overflow-x-auto">
        {tabs.map(tab => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                px-4 py-2 text-xs font-medium whitespace-nowrap rounded-t-lg transition-all
                ${active 
                  ? 'text-zamp-text bg-zamp-bg3 border-b-2 border-zamp-accent' 
                  : 'text-zamp-text3 hover:text-zamp-text hover:bg-zamp-bg3'}
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="p-6 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  );
}
