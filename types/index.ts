export interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  color: 'red' | 'green' | 'amber' | 'blue' | 'purple' | 'default';
}

export interface Loja {
  id: number;
  pda: string | null;
  bkn: string | null;
  nome: string;
  cliente: string | null;
  uf: string | null;
  regional: string | null;
  endereco: string | null;
  escopo: string | null;
  supervisor: string | null;
  pcm: string | null;
  ativo: boolean;
  chamados: Chamado[];
  preventivas: Preventiva[];
  oscs: OSC[];
}

export interface Chamado {
  id: number;
  lojaId: number;
  numeroChamado: string | null;
  pda: string | null;
  motivo: string | null;
  status: string | null;
  dataAbertura: string | null;
  mes: string | null;
  tecnico: string | null;
  descricaoServico: string | null;
  valorProposta: number | null;
  oscOsbOsd: string | null;
  statusEquipamento: string | null;
  observacoes: string | null;
  oscs: OSC[];
}

export interface OSC {
  id: number;
  chamadoId: number | null;
  lojaId: number;
  numeroOsc: string | null;
  status: string | null;
  valor: number | null;
  descricao: string | null;
  cobrancaImediata: boolean;
  loja?: Loja;
}

export interface Preventiva {
  id: number;
  lojaId: number;
  mesRef: string | null;
  ano: number | null;
  tipoManutencao: string | null;
  periodicidade: string | null;
  dataInicio: string | null;
  dataTermino: string | null;
  status: string | null;
  valorFrio: number | null;
  valorAr: number | null;
  valorTotal: number | null;
  pmocStatus: string | null;
  artVencimento: string | null;
  artStatus: string | null;
  nfNumero: string | null;
  dataPagamento: string | null;
  proximoCiclo: string | null;
  loja?: Loja;
}

export interface Faturamento {
  id: number;
  lojaId: number;
  tipo: string | null;
  status: string | null;
  nfNumero: string | null;
  dataPagamento: string | null;
  proximoCiclo: string | null;
  valor: number | null;
}

export interface BloqueioItem {
  bkn: string;
  loja: string;
  uf: string;
  corrVal: number;
  prevVal: number;
  tipo: 'CORRETIVA' | 'PREVENTIVA' | 'AMBAS';
}

export interface DashboardData {
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
}

export interface UFAggregation {
  uf: string;
  count: number;
  valorTotal: number;
  valorMaterial: number;
}
