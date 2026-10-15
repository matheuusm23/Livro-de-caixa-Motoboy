import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const jsonStr = StorageService.exportFullBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `livro_caixa_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage({ type: 'success', text: 'Backup exportado com sucesso em arquivo JSON!' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Falha ao exportar backup.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = StorageService.importFullBackup(content);
        if (ok) {
          setStatusMessage({ type: 'success', text: 'Dados restaurados com sucesso a partir do backup!' });
          onDataReloaded();
        } else {
          setStatusMessage({ type: 'error', text: 'Arquivo de backup inválido ou corrompido.' });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToDemo = () => {
    if (window.confirm('Deseja redefinir o aplicativo zerado de fábrica? Todos os lançamentos serão removidos.')) {
      StorageService.resetToDemo();
      setStatusMessage({ type: 'success', text: 'Aplicativo redefinido e zerado com sucesso!' });
      onDataReloaded();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('ATENÇÃO: Tem certeza de que deseja apagar todos os lançamentos? Essa ação não pode ser desfeita.')) {
      StorageService.saveTransactions([]);
      setStatusMessage({ type: 'success', text: 'Todos os lançamentos foram apagados.' });
      onDataReloaded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#1F2937] text-[#F9FAFB] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#111827] p-4 text-[#F9FAFB] border-b border-[#374151] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-[#34D399]" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Backup e Restauração</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4">
          {/* Status real de armazenamento */}
          <div className="p-3 bg-[#064E3B] rounded-xl border border-[#34D399]/40 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-[#34D399] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#34D399]">Armazenamento Local Ativo</h4>
              <p className="text-[11px] text-[#F9FAFB] mt-0.5">
                Seus lançamentos, categorias e contas estão salvos com persistência no armazenamento seguro do seu dispositivo.
              </p>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#064E3B] text-[#34D399] border-[#34D399]/40'
                  : 'bg-[#7F1D1D]/40 text-[#F87171] border-[#F87171]/40'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34D399]" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-[#F87171]" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Opções de Backup */}
          <div className="space-y-2">
            <button
              onClick={handleExportJSON}
              className="w-full p-3 rounded-xl border border-[#374151] bg-[#111827] hover:bg-[#374151] active:bg-[#374151]/80 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#064E3B] text-[#34D399]">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F9FAFB]">Exportar Backup (JSON)</h4>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Baixe um arquivo de segurança com todos os seus lançamentos
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3 rounded-xl border border-[#374151] bg-[#111827] hover:bg-[#374151] active:bg-[#374151]/80 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#064E3B] text-[#34D399]">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F9FAFB]">Restaurar Backup (JSON)</h4>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Recupere seus dados a partir de um arquivo previamente salvo
                  </p>
                </div>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="border-t border-[#374151] pt-3 space-y-2">
            <button
              onClick={handleResetToDemo}
              className="w-full py-2 px-3 rounded-xl border border-[#374151] bg-[#111827] hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Redefinir Aplicativo Zerado</span>
            </button>

            <button
              onClick={handleClearAll}
              className="w-full py-2 px-3 rounded-xl text-[#F87171] hover:bg-[#7F1D1D]/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar Todos os Lançamentos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
