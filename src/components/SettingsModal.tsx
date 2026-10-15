import React, { useState } from 'react';
import { X, User, Check, Shield } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [backupNoticeDismissed, setBackupNoticeDismissed] = useState(profile.backupNoticeDismissed);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'Usuário',
      email: email.trim() || 'usuario@email.com',
      backupNoticeDismissed,
    });
    onClose();
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
            <User className="h-5 w-5 text-[#34D399]" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Configurações e Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              Nome do Titular
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#374151] bg-[#111827] text-[#F9FAFB] outline-none focus:border-[#34D399]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              E-mail de Notificação
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#374151] bg-[#111827] text-[#F9FAFB] outline-none focus:border-[#34D399]"
            />
          </div>

          <div className="pt-2 border-t border-[#374151]">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!backupNoticeDismissed}
                onChange={e => setBackupNoticeDismissed(!e.target.checked)}
                className="rounded border-[#374151] bg-[#111827] text-[#34D399] focus:ring-[#34D399]"
              />
              <span className="text-xs text-[#F9FAFB] font-medium">
                Exibir cartão de aviso de backup na tela principal
              </span>
            </label>
          </div>

          <div className="p-3 bg-[#111827] rounded-xl border border-[#374151] text-[11px] text-[#9CA3AF] flex items-start space-x-2">
            <Shield className="h-4 w-4 text-[#34D399] shrink-0 mt-0.5" />
            <span>
              Moeda padrão: <strong className="text-[#F9FAFB]">Real Brasileiro (R$)</strong>. Fuso horário configurado: <strong className="text-[#F9FAFB]">América/São Paulo</strong>.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-xl border border-[#374151] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs rounded-xl bg-[#34D399] text-[#111827] font-bold flex items-center space-x-1.5 shadow-xs hover:bg-[#10B981] transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
