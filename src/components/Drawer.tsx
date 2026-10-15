import React from 'react';
import {
  BookOpen,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Tags,
  Calendar,
  Settings,
  Database,
  LogOut,
  X,
  ShieldCheck,
  User
} from 'lucide-react';
import { UserProfile } from '../types/finance';
import { formatBRL } from '../utils/currency';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSelectView: (view: string) => void;
  profile: UserProfile;
  totalBalanceInCents: number;
  onOpenBackup: () => void;
  onOpenSettings: () => void;
  onLogoutOrReset: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  profile,
  totalBalanceInCents,
  onOpenBackup,
  onOpenSettings,
  onLogoutOrReset,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'livro', label: 'Livro Caixa', icon: BookOpen, color: 'text-[#34D399]' },
    { id: 'dashboard', label: 'Dashboard financeiro', icon: BarChart3, color: 'text-[#34D399]' },
    { id: 'escala', label: 'Escala e Folgas', icon: Calendar, color: 'text-[#34D399]' },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp, color: 'text-[#34D399]' },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown, color: 'text-[#F87171]' },
    { id: 'categorias', label: 'Categorias', icon: Tags, color: 'text-[#9CA3AF]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-xs h-full bg-[#1F2937] text-[#F9FAFB] border-r border-[#374151] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
        {/* Header do Drawer */}
        <div className="bg-[#111827] p-5 text-[#F9FAFB] border-b border-[#374151] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-[#064E3B] border border-[#34D399]/40 flex items-center justify-center font-bold text-lg text-[#34D399]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-base leading-tight text-[#F9FAFB]">{profile.name}</h2>
                <p className="text-xs text-[#9CA3AF] truncate max-w-[160px]">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-[#1F2937] rounded-lg p-2.5 mt-1 border border-[#374151]">
            <span className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-medium">Saldo Geral Acumulado</span>
            <div className="text-lg font-bold tracking-tight text-[#34D399]">
              {formatBRL(totalBalanceInCents)}
            </div>
          </div>
        </div>

        {/* Lista de Navegação */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 py-1 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
            Navegação Principal
          </div>

          <nav className="space-y-0.5 px-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#064E3B] text-[#34D399] font-semibold border border-[#34D399]/30'
                      : 'text-[#F9FAFB] hover:bg-[#374151] active:bg-[#374151]'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3.5 ${isActive ? 'text-[#34D399]' : item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="my-2 border-t border-[#374151] mx-3" />

          <div className="px-3 py-1 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
            Ferramentas & Sistema
          </div>

          <nav className="space-y-0.5 px-2">
            <button
              onClick={() => {
                onOpenBackup();
                onClose();
              }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#F9FAFB] hover:bg-[#374151] transition-colors"
            >
              <Database className="h-5 w-5 mr-3.5 text-[#34D399]" />
              <span>Backup e restauração</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-[#F9FAFB] hover:bg-[#374151] transition-colors"
            >
              <Settings className="h-5 w-5 mr-3.5 text-[#9CA3AF]" />
              <span>Configurações</span>
            </button>
          </nav>
        </div>

        {/* Rodapé do Drawer */}
        <div className="p-3 border-t border-[#374151] bg-[#111827]">
          <button
            onClick={() => {
              onLogoutOrReset();
              onClose();
            }}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-[#F87171] hover:bg-[#7F1D1D]/30 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-[#F87171]" />
            <span>Sair / Redefinir dados</span>
          </button>
          <div className="mt-2 text-center text-[10px] text-[#9CA3AF] flex items-center justify-center space-x-1">
            <ShieldCheck className="h-3 w-3 text-[#34D399]" />
            <span>Armazenamento local seguro ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
