import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Search, MoreVertical, Plus, BarChart3, Database, HelpCircle, Check } from 'lucide-react';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onOpenNewTransaction: (type?: 'income' | 'expense') => void;
  onOpenBackup: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  onOpenSearch,
  onOpenNewTransaction,
  onOpenBackup,
  currentView,
  onChangeView,
}) => {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<string, string> = {
    livro: 'Livro Caixa',
    dashboard: 'Dashboard Financeiro',
    escala: 'Escala e Folgas',
    categorias: 'Categorias',
  };

  const titleText = viewTitles[currentView] || 'Livro Caixa';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#1F2937] text-[#F9FAFB] border-b border-[#374151] shadow-md transition-colors select-none">
      <div className="flex h-14 items-center justify-between px-3 md:px-4">
        {/* Esquerda: Hambúrguer, Título e Seta para baixo */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onOpenDrawer}
            aria-label="Abrir menu de navegação"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#374151] active:bg-[#374151]/80 transition-colors"
          >
            <Menu className="h-6 w-6 text-[#F9FAFB]" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowViewDropdown(prev => !prev)}
              aria-label="Alternar módulo ou visão financeira"
              className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg hover:bg-[#374151] active:bg-[#374151]/80 transition-colors text-left"
            >
              <span className="font-medium text-lg tracking-wide text-[#F9FAFB] font-['Roboto',sans-serif]">
                {titleText}
              </span>
              <ChevronDown className={`h-4 w-4 text-[#9CA3AF] transition-transform duration-200 ${showViewDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown de visão rápida */}
            {showViewDropdown && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#1F2937] border border-[#374151] shadow-2xl ring-1 ring-black/40 py-1.5 z-50 text-[#F9FAFB]">
                <div className="px-3 py-1.5 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Módulos Financeiros
                </div>
                <button
                  onClick={() => { onChangeView('livro'); setShowViewDropdown(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-[#374151] active:bg-[#374151] transition-colors"
                >
                  <span className="font-medium">Livro Caixa</span>
                  {currentView === 'livro' && <Check className="h-4 w-4 text-[#34D399]" />}
                </button>
                <button
                  onClick={() => { onChangeView('dashboard'); setShowViewDropdown(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-[#374151] active:bg-[#374151] transition-colors"
                >
                  <span className="font-medium">Dashboard Financeiro</span>
                  {currentView === 'dashboard' && <Check className="h-4 w-4 text-[#34D399]" />}
                </button>
                <button
                  onClick={() => { onChangeView('escala'); setShowViewDropdown(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-[#374151] active:bg-[#374151] transition-colors"
                >
                  <span className="font-medium">Escala de Folgas & Diária</span>
                  {currentView === 'escala' && <Check className="h-4 w-4 text-[#34D399]" />}
                </button>
                <button
                  onClick={() => { onChangeView('categorias'); setShowViewDropdown(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-[#374151] active:bg-[#374151] transition-colors"
                >
                  <span className="font-medium">Categorias</span>
                  {currentView === 'categorias' && <Check className="h-4 w-4 text-[#34D399]" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Direita: Ícones de Ação */}
        <div className="flex items-center space-x-1 sm:space-x-2">

          {/* Pesquisar */}
          <button
            onClick={onOpenSearch}
            title="Pesquisar lançamentos"
            aria-label="Pesquisar lançamentos"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#374151] active:bg-[#374151]/80 transition-colors"
          >
            <Search className="h-5 w-5 text-[#F9FAFB]" />
          </button>

          {/* Menu de 3 pontos */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(prev => !prev)}
              title="Mais opções"
              aria-label="Mais opções"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#374151] active:bg-[#374151]/80 transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-[#F9FAFB]" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#1F2937] border border-[#374151] shadow-2xl ring-1 ring-black/40 py-1.5 z-50 text-[#F9FAFB]">
                <button
                  onClick={() => {
                    onOpenNewTransaction();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-[#374151] transition-colors text-left font-medium"
                >
                  <Plus className="h-4 w-4 mr-2.5 text-[#34D399]" />
                  Novo Lançamento
                </button>
                <button
                  onClick={() => {
                    onChangeView('dashboard');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-[#374151] transition-colors text-left"
                >
                  <BarChart3 className="h-4 w-4 mr-2.5 text-[#34D399]" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    onOpenBackup();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-[#374151] transition-colors text-left"
                >
                  <Database className="h-4 w-4 mr-2.5 text-[#9CA3AF]" />
                  Backup e Restauração
                </button>
                <div className="my-1 border-t border-[#374151]" />
                <button
                  onClick={() => {
                    alert('Livro Caixa v1.0\nAplicativo de controle financeiro pessoal com suporte a moedas BRL, cálculos seguros e exportação.');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-[#374151] transition-colors text-left text-[#9CA3AF]"
                >
                  <HelpCircle className="h-4 w-4 mr-2.5 text-[#9CA3AF]" />
                  Sobre o App
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
