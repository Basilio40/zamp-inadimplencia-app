'use client';

import { useState } from 'react';
import { Upload, FileCheck, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function ImportarPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [cnpjDragActive, setCnpjDragActive] = useState(false);
  const [cnpjFile, setCnpjFile] = useState<File | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjResult, setCnpjResult] = useState<any>(null);
  const [cnpjError, setCnpjError] = useState('');

  async function handleUpload(fileToUpload: File) {
    setFile(fileToUpload);
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  }

  async function handleCnpjUpload(fileToUpload: File) {
    setCnpjFile(fileToUpload);
    setCnpjLoading(true);
    setCnpjError('');
    
    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    try {
      const res = await fetch('/api/importar/cnpj', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCnpjResult(data);
    } catch (e: any) {
      setCnpjError(e.message);
    } finally {
      setCnpjLoading(false);
    }
  }

  function handleCnpjDrop(e: React.DragEvent) {
    e.preventDefault();
    setCnpjDragActive(false);
    if (e.dataTransfer.files?.[0]) handleCnpjUpload(e.dataTransfer.files[0]);
  }

  return (
    <div className="min-h-screen bg-zamp-bg p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="bg-zamp-blue-bg border border-zamp-blue rounded-lg p-3 text-xs text-zamp-blue">
          📤 <strong>Importar Planilhas Excel</strong> — Atualize os dados do dashboard subindo os arquivos originais. Todos os dados são processados no servidor.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">1. GESTÃO (.xlsx)</h4>
              <span className="text-[11px] font-mono text-zamp-text3">Chamados + Preventivas + ARTs</span>
            </div>
            <div 
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-gestao')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-zamp-accent bg-zamp-accent/5' : 'border-zamp-border2 hover:border-zamp-accent'
              }`}
            >
              <Upload className="mx-auto mb-2 text-zamp-text2" size={28} />
              <p className="text-sm text-zamp-text2">Arraste o arquivo <strong>GESTÃO.xlsx</strong> aqui<br/>ou clique para selecionar</p>
              {file && <p className="mt-2 text-[11px] font-mono text-zamp-accent">{file.name}</p>}
            </div>
            <input id="file-gestao" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>

          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider">2. RELAÇÃO BKN → CNPJ (.xlsx)</h4>
              <span className="text-[11px] font-mono text-zamp-text3">relacao_lojas.xlsx</span>
            </div>
            <div 
              onDragOver={e => { e.preventDefault(); setCnpjDragActive(true); }}
              onDragLeave={() => setCnpjDragActive(false)}
              onDrop={handleCnpjDrop}
              onClick={() => document.getElementById('file-cnpj')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                cnpjDragActive ? 'border-zamp-accent bg-zamp-accent/5' : 'border-zamp-border2 hover:border-zamp-accent'
              }`}
            >
              <FileSpreadsheet className="mx-auto mb-2 text-zamp-text2" size={28} />
              <p className="text-sm text-zamp-text2">Arraste o arquivo <strong>relacao_lojas.xlsx</strong> aqui<br/>ou clique para selecionar</p>
              <p className="text-[11px] text-zamp-text3 mt-1">Colunas: BKN + CNPJ</p>
              {cnpjFile && <p className="mt-2 text-[11px] font-mono text-zamp-accent">{cnpjFile.name}</p>}
            </div>
            <input id="file-cnpj" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && handleCnpjUpload(e.target.files[0])} />
          </div>
        </div>

        {loading && (
          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-6 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zamp-accent border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-zamp-text2">Processando planilha...</p>
          </div>
        )}

        {error && (
          <div className="bg-zamp-red-bg border border-zamp-red-border rounded-xl p-4 flex items-center gap-2 text-zamp-red text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {result && (
          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="text-zamp-green" size={18} />
              <h4 className="text-sm font-semibold">Importação concluída</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Object.entries(result).map(([key, val]: [string, any]) => (
                <div key={key} className="bg-zamp-bg3 border border-zamp-border rounded-lg p-3">
                  <div className="text-zamp-text3 font-mono uppercase text-[10px]">{key}</div>
                  <div className="text-zamp-text font-mono text-lg">{val}</div>
                  <div className="text-zamp-text3">linhas importadas</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cnpjLoading && (
          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-6 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-zamp-accent border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-zamp-text2">Correlacionando BKN → CNPJ...</p>
          </div>
        )}

        {cnpjError && (
          <div className="bg-zamp-red-bg border border-zamp-red-border rounded-xl p-4 flex items-center gap-2 text-zamp-red text-sm">
            <AlertCircle size={16} /> {cnpjError}
          </div>
        )}

        {cnpjResult && (
          <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="text-zamp-green" size={18} />
              <h4 className="text-sm font-semibold">CNPJs atualizados</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-zamp-bg3 border border-zamp-border rounded-lg p-3">
                <div className="text-zamp-text3 font-mono uppercase text-[10px]">Atualizados</div>
                <div className="text-zamp-green font-mono text-lg">{cnpjResult.atualizados}</div>
                <div className="text-zamp-text3">lojas com CNPJ</div>
              </div>
              <div className="bg-zamp-bg3 border border-zamp-border rounded-lg p-3">
                <div className="text-zamp-text3 font-mono uppercase text-[10px]">Não encontrados</div>
                <div className="text-zamp-amber font-mono text-lg">{cnpjResult.naoEncontrados}</div>
                <div className="text-zamp-text3">BKN sem loja</div>
              </div>
              {cnpjResult.erros && (
                <div className="bg-zamp-bg3 border border-zamp-border rounded-lg p-3">
                  <div className="text-zamp-text3 font-mono uppercase text-[10px]">Avisos</div>
                  <div className="text-zamp-red font-mono text-lg">{cnpjResult.erros.length}</div>
                  <div className="text-zamp-text3">aba(s) sem BKN/CNPJ</div>
                </div>
              )}
            </div>
            {cnpjResult.erros && cnpjResult.erros.length > 0 && (
              <div className="mt-3 text-[11px] text-zamp-red space-y-1">
                {cnpjResult.erros.map((err: string, i: number) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-zamp-bg2 border border-zamp-border rounded-xl p-4">
          <h4 className="text-[11px] font-mono text-zamp-text3 uppercase tracking-wider mb-3">Instruções</h4>
          <div className="text-xs text-zamp-text2 space-y-2 leading-relaxed">
            <p><strong>GESTÃO.xlsx</strong> — O sistema detecta automaticamente as abas relevantes:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><code className="bg-zamp-bg3 px-1 rounded">CHAMADOS 2026</code> → Atualiza dados de <strong>corretivas</strong> (OSCs, valores, status)</li>
              <li><code className="bg-zamp-bg3 px-1 rounded">PREVENTIVA [MÊS] - 2026</code> → Atualiza dados de <strong>preventivas</strong> por mês</li>
              <li><code className="bg-zamp-bg3 px-1 rounded">ARTS</code> → Atualiza dados de contratos/ARTs</li>
            </ul>
            <p><strong>RELAÇÃO BKN → CNPJ (.xlsx)</strong> — Atualiza o CNPJ das lojas existentes:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Detecta automaticamente as colunas <strong>BKN</strong> (ou PDA, Código Cliente, etc.) e <strong>CNPJ</strong></li>
              <li>Busca a loja pelo BKN no banco de dados e atualiza o campo CNPJ</li>
              <li>Funciona com qualquer arquivo .xlsx que contenha as colunas BKN e CNPJ</li>
            </ul>
            <p className="text-zamp-red">⚠️ Atenção: A importação substitui os dados em memória. Exporte um backup antes se necessário.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
