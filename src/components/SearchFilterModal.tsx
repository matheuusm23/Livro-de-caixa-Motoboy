import React, { useState } from 'react';
import { X, Search, Filter, RotateCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Account, Category } from '../types/finance';
import { EnrichedTransaction } from '../utils/calculations';
import { formatBRL } from '../utils/currency';
import { formatDateBR } from '../utils/date';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTransactions: EnrichedTransaction[];
  categories: Category[];
  accounts?: Account[];
  onSelectTransaction: (tx: EnrichedTransaction) => void;
}

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  allTransactions,
  categories,
  onSelectTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const filtered = allTransactions.filter(tx => {
    // Search text match (description or notes)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchNotes) return false;
    }

    // Type match
    if (typeFilter !== 'all' && tx.type !== typeFilter) {
      return false;
    }

    // Scope match
    if (scopeFilter === 'daily' && tx.periodScope !== 'daily') {
      return false;
    }
    if (scopeFilter === 'weekly' && tx.periodScope !== 'weekly') {
      return false;
    }
    if (scopeFilter === 'monthly' && (tx.periodScope === 'daily' || tx.periodScope === 'weekly')) {
      return false;
    }

    // Category match
    if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
      return false;
    }

    // Date range match
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

    return true;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setScopeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const totalFilteredIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amountInCents, 0);

  const totalFilteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountInCents, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-[#1F2937] text-[#F9FAFB] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#111827] p-4 text-[#F9FAFB] border-b border-[#374151] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-[#34D399]" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Pesquisa e Filtros Avançados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário de Filtros */}
        <div className="p-4 bg-[#111827] border-b border-[#374151] space-y-3">
          {/* Termo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Pesquisar por descrição ou anotação..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#374151] bg-[#1F2937] text-[#F9FAFB] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 outline-none placeholder-[#6B7280]"
            />
          </div>

          {/* Tipo, Escopo e Categorias */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase mb-0.5">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="w-full text-xs p-1.5 rounded-lg border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
              >
                <option value="all">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase mb-0.5">
                Página / Escopo
              </label>
              <select
                value={scopeFilter}
                onChange={e => setScopeFilter(e.target.value as any)}
                className="w-full text-xs p-1.5 rounded-lg border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
              >
                <option value="all">Todas as Páginas</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase mb-0.5">
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none truncate"
              >
                <option value="all">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Intervalo de datas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase mb-0.5">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase mb-0.5">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#9CA3AF]">
              Encontrados: <strong className="text-[#F9FAFB]">{filtered.length}</strong> lançamentos
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-[#34D399] hover:underline font-medium flex items-center"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Totais dos Resultados Filtrados */}
        <div className="grid grid-cols-2 bg-[#1F2937] border-b border-[#374151] p-2 text-center text-xs">
          <div>
            <span className="text-[#34D399] font-bold">Total Receitas: </span>
            <span className="font-extrabold text-[#34D399]">{formatBRL(totalFilteredIncome)}</span>
          </div>
          <div>
            <span className="text-[#F87171] font-bold">Total Despesas: </span>
            <span className="font-extrabold text-[#F87171]">{formatBRL(totalFilteredExpense)}</span>
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#374151]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9CA3AF]">
              Nenhum lançamento encontrado para os filtros selecionados.
            </div>
          ) : (
            filtered.map(tx => {
              const isIncome = tx.type === 'income';
              const catName = categoryMap.get(tx.categoryId) || 'Sem Categoria';

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    onSelectTransaction(tx);
                    onClose();
                  }}
                  className="p-3 hover:bg-[#374151]/40 active:bg-[#374151] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isIncome ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#7F1D1D]/40 text-[#F87171]'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-[#F9FAFB]">{tx.description}</h4>
                        {tx.periodScope === 'daily' && (
                          <span className="text-[9px] bg-[#064E3B] text-[#34D399] border border-[#34D399]/30 font-semibold px-1 rounded">
                            Diário
                          </span>
                        )}
                        {tx.periodScope === 'weekly' && (
                          <span className="text-[9px] bg-[#111827] text-[#9CA3AF] border border-[#374151] font-semibold px-1 rounded">
                            Semanal
                          </span>
                        )}
                        {tx.periodScope === 'monthly' && (
                          <span className="text-[9px] bg-[#111827] text-[#9CA3AF] border border-[#374151] font-semibold px-1 rounded">
                            Mensal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {formatDateBR(tx.date)} • {catName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        isIncome ? 'text-[#34D399]' : 'text-[#F87171]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatBRL(tx.amountInCents)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
