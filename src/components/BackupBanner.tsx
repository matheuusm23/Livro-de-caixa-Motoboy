import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface BackupBannerProps {
  onConfigureBackup: () => void;
  onDismiss: () => void;
}

export const BackupBanner: React.FC<BackupBannerProps> = ({
  onConfigureBackup,
  onDismiss,
}) => {
  return (
    <div className="mx-3 my-2.5 rounded-xl bg-[#1F2937] p-3.5 shadow-xs border border-[#374151] transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-[#064E3B] text-[#34D399] mt-0.5 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="pr-2">
            <h3 className="text-sm font-semibold text-[#F9FAFB] leading-snug">
              Ativar backup e restauração
            </h3>
            <p className="mt-0.5 text-xs text-[#9CA3AF] leading-relaxed">
              Mantenha seus dados financeiros protegidos e sincronizados.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          title="Fechar lembrete"
          aria-label="Fechar lembrete"
          className="text-[#9CA3AF] hover:text-[#F9FAFB] p-1 rounded-full hover:bg-[#374151] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end space-x-2">
        <button
          onClick={onDismiss}
          className="rounded-lg border border-[#374151] bg-[#111827] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
        >
          Agora não
        </button>
        <button
          onClick={onConfigureBackup}
          className="rounded-lg bg-[#34D399] px-3.5 py-1.5 text-xs font-semibold text-[#111827] shadow-xs hover:bg-[#10B981] transition-colors"
        >
          Configurar backup
        </button>
      </div>
    </div>
  );
};
