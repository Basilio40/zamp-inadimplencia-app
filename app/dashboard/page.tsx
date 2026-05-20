'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import { formatBRLK, formatBRL } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardData {
  totalCorretivas: number;
  lojasInadimplentes: number;
  valorCorretivas: number;
  materialParado: number;
  totalPreventivasPendentes: number;
  lojasPreventivasPendentes: number;
  valorPreventivasPendentes: number;
  totalCobrancaImediata: number;
  valorCobrancaImediata: number;
  topLojaBkn: string;
  topLojaNome: string;
  topLojaValor: number;
  ufAggregation: { uf: string; count: number; valorTotal: number; valorMaterial: number }[];
}

export default function ResumoPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dados/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zamp-text3 text-center py-20">Carregando...</div>;
  if (!data) return <div className="text-zamp-red text-center py-20">Erro ao carregar dados</div>;

  const ufColors = ['#e24b4a', '#f9ab00', '#f9ab00', '#4285f4', '#4285f4', '#34a853', '#9c6fd6', '#00bcd4', '#ff9800', '#e91e63'];
  const top8 = data.ufAggregation.slice(0, 8);

  const statusData = [
    { name: 'Executado', value: 45, color: '#34a853' },
    { name: 'Folha Serv.', value: 32, color: '#f9ab00' },
    { name: 'Mat. Liberado', value: 28, color: '#4285f4' },
    { name: 'Ag. Solic.', value: 15, color: '#9c6fd6' },
  ];

  const prevData = [
    { mes: 'Fevereiro', fat: 101, pend: 15 },
    { mes: 'Março', fat: 44, pend: 157 },
  ];

  return (
    <div className="space-y-4">
      {/* Alert */}
      <div className="bg-zamp-red-bg border border-zamp-red-border rounded-lg p-3 text-xs text-zamp-red">
        ⛔ <strong>Situação:</strong> {data.lojasInadimplentes} lojas inadimplentes em corretivas ({formatBRLK(data.valorCorretivas)}) + {data.lojasPreventivasPendentes} pendentes em preventivas ({formatBRLK(data.valorPreventivasPendentes)}). Total em aberto: <strong>{formatBRL(data.valorCorretivas + data.valorPreventivasPendentes)}</strong> · Ciclo bimestral: +60 dias após pagamento
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        <MetricCard label="Total em aberto" value={formatBRLK(data.valorCorretivas + data.valorPreventivasPendentes)} sub="corretivas + preventivas" color="red" />
        <MetricCard label="Lojas inadimp. corretivas" value={String(data.lojasInadimplentes)} sub={`${data.totalCorretivas} OSCs`} color="red" />
        <MetricCard label="Valor corretivas" value={formatBRLK(data.valorCorretivas)} sub={`material: ${formatBRLK(data.materialParado)}`} color="red" />
        <MetricCard label="Preventivas pendentes" value={String(data.lojasPreventivasPendentes)} sub={formatBRLK(data.valorPreventivasPendentes)} color="amber" />
        <MetricCard label="Escopo contrato" value="501" sub="lojas ZAMP bimestral" color="blue" />
        <MetricCard label="Cobrança imediata" value={String(data.totalCobrancaImediata)} sub="OSCs prontas pra NF" color="amber" />
        <MetricCard label="Mat. já desembolsado" value={formatBRLK(data.materialParado)} sub="risco financeiro real" color="purple" />
        <MetricCard label="Corretivas · maior loja" value={formatBRLK(data.topLojaValor)} sub={`BKN ${data.topLojaBkn}`} color="amber" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">Valor corretivas por UF</h4>
            <span className="text-[11px] font-mono text-zamp-amber">{formatBRLK(data.valorCorretivas)}</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ufAggregation.slice(0, 10)}>
                <XAxis dataKey="uf" tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                <YAxis tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickFormatter={v => formatBRLK(v)} />
                <Tooltip 
                  contentStyle={{ background: '#1a1d21', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6, fontSize: 12 }}
                  formatter={(value: number) => formatBRL(value)}
                />
                <Bar dataKey="valorTotal" radius={[3, 3, 0, 0]}>
                  {data.ufAggregation.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={ufColors[i % ufColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">Comparativo preventivas Fev × Mar</h4>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prevData}>
                <XAxis dataKey="mes" tick={{ fill: '#9aa0a8', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <YAxis tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6 }} />
                <Bar dataKey="fat" stackId="a" fill="#34a853" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pend" stackId="a" fill="#e24b4a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-2 text-[11px] text-zamp-text3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#34a853] rounded-sm inline-block" />Faturado</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#e24b4a] rounded-sm inline-block" />Pendente</span>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
          <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider mb-3">Top 8 lojas · corretivas (R$)</h4>
          <div className="space-y-2">
            {top8.map((u, i) => (
              <div key={u.uf} className="flex items-center gap-3">
                <div className="w-[120px] text-[11px] text-zamp-text2 font-mono truncate">{u.uf}</div>
                <div className="flex-1 h-2.5 bg-zamp-bg3 rounded-sm overflow-hidden">
                  <div 
                    className="h-full rounded-sm transition-all duration-500"
                    style={{ 
                      width: `${Math.round((u.valorTotal / (top8[0]?.valorTotal || 1)) * 100)}%`,
                      background: ufColors[i % ufColors.length]
                    }}
                  />
                </div>
                <div className="w-[80px] text-right text-[11px] font-mono text-zamp-text">{formatBRLK(u.valorTotal)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
          <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider mb-3">Status OSCs corretivas</h4>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="var(--bg2)"
                  strokeWidth={2}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-zamp-text3">
            {statusData.map(s => (
              <span key={s.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />{s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
