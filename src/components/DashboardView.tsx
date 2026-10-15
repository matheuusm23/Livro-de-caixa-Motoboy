import React, { useState, useMemo } from 'react';
import { Account, Category, Transaction } from '../types/finance';
import { computeAllAccumulatedBalances } from '../utils/calculations';
import { formatBRL } from '../utils/currency';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  TrendingUp,
  PiggyBank,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  RotateCcw,
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentDate?: Date;
  onBackToLivro: () => void;
  onNewTransaction: (type?: 'income' | 'expense') => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  accounts,
  currentDate = new Date(2026, 9, 10, 12, 0, 0),
  onBackToLivro,
  onNewTransaction,
}) => {
  // Mês e Ano de referência atual
  const initialYear = currentDate.getFullYear();
  const initialMonth = currentDate.getMonth();

  // Estado de modo de visualização: 'month' (Mês selecionado) ou 'year' (Ano inteiro)
  // Conforme solicitação: colocando como principal na tela um mês atual que ele está
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);

  // Anos disponíveis para seleção (baseados nos lançamentos e ano atual)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(initialYear);
    yearsSet.add(initialYear - 1);
    yearsSet.add(initialYear + 1);

    transactions.forEach(t => {
      const y = parseInt(t.date.substring(0, 4), 10);
      if (!isNaN(y)) yearsSet.add(y);
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions, initialYear]);

  // Transações filtradas pelo período selecionado (mês ou ano inteiro)
  const filteredTransactions = useMemo(() => {
    if (viewMode === 'month') {
      const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      return transactions.filter(t => t.date.startsWith(monthPrefix));
    } else {
      const yearPrefix = `${selectedYear}-`;
      return transactions.filter(t => t.date.startsWith(yearPrefix));
    }
  }, [transactions, viewMode, selectedYear, selectedMonth]);

  // Totais do período selecionado
  const periodIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amountInCents, 0);
  }, [filteredTransactions]);

  const periodExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amountInCents, 0);
  }, [filteredTransactions]);

  const periodNet = periodIncome - periodExpense;

  const savingsRate = periodIncome > 0
    ? Math.max(0, Math.round(((periodIncome - periodExpense) / periodIncome) * 100))
    : 0;

  // Saldo geral total acumulado histórico
  const enriched = useMemo(() => {
    return computeAllAccumulatedBalances(transactions);
  }, [transactions]);

  const totalBalance = enriched.length > 0
    ? enriched[enriched.length - 1].accumulatedBalanceInCents
    : 0;

  // Despesas por categoria no período selecionado
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const sortedCategoryExpenses = useMemo(() => {
    const expensesByCategory = new Map<string, number>();
    for (const t of filteredTransactions) {
      if (t.type === 'expense') {
        const cur = expensesByCategory.get(t.categoryId) || 0;
        expensesByCategory.set(t.categoryId, cur + t.amountInCents);
      }
    }

    return Array.from(expensesByCategory.entries())
      .map(([catId, amount]) => ({
        category: categoryMap.get(catId) || {
          id: catId,
          name: 'Outras',
          color: '#9CA3AF',
          type: 'expense' as const,
          icon: '',
        },
        amount,
        percentage: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap, periodExpense]);

  // Evolução mensal (12 meses) para o modo Ano Inteiro
  const yearMonthlyBreakdown = useMemo(() => {
    if (viewMode !== 'year') return [];

    return Array.from({ length: 12 }, (_, mIndex) => {
      const monthPrefix = `${selectedYear}-${String(mIndex + 1).padStart(2, '0')}`;
      const monthTxs = transactions.filter(t => t.date.startsWith(monthPrefix));

      const income = monthTxs
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amountInCents, 0);

      const expense = monthTxs
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amountInCents, 0);

      const net = income - expense;

      return {
        monthIndex: mIndex,
        name: MONTH_NAMES[mIndex],
        shortName: MONTH_NAMES_SHORT[mIndex],
        income,
        expense,
        net,
        count: monthTxs.length,
      };
    });
  }, [transactions, viewMode, selectedYear]);

  // Navegação de mês
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Navegação de ano
  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  // Ir para mês atual
  const handleGoToCurrentMonth = () => {
    setSelectedYear(initialYear);
    setSelectedMonth(initialMonth);
    setViewMode('month');
  };

  const isCurrentMonthActive =
    viewMode === 'month' &&
    selectedYear === initialYear &&
    selectedMonth === initialMonth;

  return (
    <div className="flex-1 overflow-y-auto bg-[#111827] p-3 sm:p-5 space-y-4">
      {/* Barra de Título do Módulo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB]">Dashboard Financeiro</h2>
          <p className="text-xs text-[#9CA3AF]">
            {viewMode === 'month'
              ? `Visão detalhada de ${MONTH_NAMES[selectedMonth]} de ${selectedYear}`
              : `Visão consolidada do ano de ${selectedYear}`}
          </p>
        </div>
        <button
          onClick={onBackToLivro}
          className="text-xs font-semibold px-3 py-1.5 bg-[#1F2937] border border-[#374151] text-[#34D399] rounded-lg shadow-2xs hover:bg-[#374151] transition-colors"
        >
          Voltar ao Livro Caixa
        </button>
      </div>

      {/* Painel de Seleção: Mês Específico vs Ano Inteiro */}
      <div className="bg-[#1F2937] p-3 sm:p-4 rounded-2xl border border-[#374151] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Seletor de Modo: [Mês Atual / Específico] | [Ano Inteiro] */}
          <div className="inline-flex p-1 bg-[#111827] rounded-xl border border-[#374151]">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-[#34D399] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151]/50'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Por Mês</span>
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'year'
                  ? 'bg-[#34D399] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151]/50'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Ano Inteiro</span>
            </button>
          </div>

          {/* Controles de Navegação no Período Selecionado */}
          <div className="flex items-center space-x-2">
            {viewMode === 'month' ? (
              /* Navegador Mensal */
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151] transition-colors"
                  title="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Dropdown Mês */}
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#F9FAFB] outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx} className="bg-[#1F2937] text-[#F9FAFB]">
                      {name}
                    </option>
                  ))}
                </select>

                {/* Dropdown Ano */}
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                  className="text-xs font-bold px-2 py-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#F9FAFB] outline-none cursor-pointer"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr} className="bg-[#1F2937] text-[#F9FAFB]">
                      {yr}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151] transition-colors"
                  title="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {!isCurrentMonthActive && (
                  <button
                    onClick={handleGoToCurrentMonth}
                    className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#064E3B] text-[#34D399] border border-[#34D399]/40 hover:bg-[#064E3B]/80 transition-colors ml-1"
                    title="Voltar ao mês atual"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Mês Atual</span>
                  </button>
                )}
              </div>
            ) : (
              /* Navegador Anual */
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handlePrevYear}
                  className="p-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151] transition-colors"
                  title="Ano anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#F9FAFB] outline-none cursor-pointer"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr} className="bg-[#1F2937] text-[#F9FAFB]">
                      Ano {yr}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextYear}
                  className="p-1.5 rounded-lg border border-[#374151] bg-[#111827] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#374151] transition-colors"
                  title="Próximo ano"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {selectedYear !== initialYear && (
                  <button
                    onClick={() => setSelectedYear(initialYear)}
                    className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#064E3B] text-[#34D399] border border-[#34D399]/40 hover:bg-[#064E3B]/80 transition-colors ml-1"
                    title="Voltar ao ano atual"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Ano Atual ({initialYear})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Indicador do período em exibição */}
        <div className="pt-2 border-t border-[#374151] flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>
            Exibindo dados de:{' '}
            <strong className="text-[#34D399]">
              {viewMode === 'month'
                ? `${MONTH_NAMES[selectedMonth]} de ${selectedYear}`
                : `Todo o Ano de ${selectedYear}`}
            </strong>
          </span>
          <span>{filteredTransactions.length} movimentações encontradas</span>
        </div>
      </div>

      {/* Cards de Resumo Rápido (KPIs do Período Escolhido) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Resultado do Período */}
        <div className="bg-[#1F2937] p-3.5 rounded-xl border border-[#374151] shadow-xs">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
            <span className="text-[11px] font-bold uppercase">Resultado Líquido</span>
            <Wallet className="h-4 w-4 text-[#34D399]" />
          </div>
          <div
            className={`text-base sm:text-lg font-black ${
              periodNet >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
            }`}
          >
            {periodNet >= 0 ? '+' : ''}
            {formatBRL(periodNet)}
          </div>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
            {periodNet >= 0 ? 'Superávit do período' : 'Déficit do período'}
          </span>
        </div>

        {/* Total Receitas */}
        <div className="bg-[#1F2937] p-3.5 rounded-xl border border-[#374151] shadow-xs">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
            <span className="text-[11px] font-bold uppercase">Total Receitas</span>
            <ArrowUpRight className="h-4 w-4 text-[#34D399]" />
          </div>
          <div className="text-base sm:text-lg font-black text-[#34D399]">
            {formatBRL(periodIncome)}
          </div>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
            Entradas no período
          </span>
        </div>

        {/* Total Despesas */}
        <div className="bg-[#1F2937] p-3.5 rounded-xl border border-[#374151] shadow-xs">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
            <span className="text-[11px] font-bold uppercase">Total Despesas</span>
            <ArrowDownRight className="h-4 w-4 text-[#F87171]" />
          </div>
          <div className="text-base sm:text-lg font-black text-[#F87171]">
            {formatBRL(periodExpense)}
          </div>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
            Saídas no período
          </span>
        </div>

        {/* Taxa de Poupança */}
        <div className="bg-[#1F2937] p-3.5 rounded-xl border border-[#374151] shadow-xs">
          <div className="flex items-center justify-between text-[#9CA3AF] mb-1">
            <span className="text-[11px] font-bold uppercase">Taxa de Poupança</span>
            <PiggyBank className="h-4 w-4 text-[#34D399]" />
          </div>
          <div className="text-base sm:text-lg font-black text-[#F9FAFB]">
            {savingsRate}%
          </div>
          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
            Retenção de renda
          </span>
        </div>
      </div>

      {/* Visão de 12 Meses quando no modo "Ano Inteiro" */}
      {viewMode === 'year' && (
        <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-[#34D399]" />
              <h3 className="text-sm font-bold text-[#F9FAFB]">
                Evolução Mês a Mês ({selectedYear})
              </h3>
            </div>
            <span className="text-xs text-[#9CA3AF]">
              Toque em qualquer mês para abrir seus detalhes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
            {yearMonthlyBreakdown.map(item => (
              <div
                key={item.monthIndex}
                onClick={() => {
                  setSelectedMonth(item.monthIndex);
                  setViewMode('month');
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none hover:border-[#34D399] ${
                  item.monthIndex === initialMonth && selectedYear === initialYear
                    ? 'bg-[#064E3B]/30 border-[#34D399]/60'
                    : 'bg-[#111827] border-[#374151] hover:bg-[#374151]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#F9FAFB]">
                    {item.shortName}
                  </span>
                  {item.monthIndex === initialMonth && selectedYear === initialYear && (
                    <span className="text-[8px] bg-[#34D399] text-[#111827] font-bold px-1 rounded">
                      Atual
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between text-[#34D399]">
                    <span>Rec:</span>
                    <strong className="truncate ml-1">{formatBRL(item.income)}</strong>
                  </div>
                  <div className="flex justify-between text-[#F87171]">
                    <span>Desp:</span>
                    <strong className="truncate ml-1">{formatBRL(item.expense)}</strong>
                  </div>
                  <div className="pt-1 border-t border-[#374151] flex justify-between font-bold">
                    <span className="text-[#9CA3AF]">Saldo:</span>
                    <span
                      className={`truncate ml-1 ${
                        item.net >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                      }`}
                    >
                      {formatBRL(item.net)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição por Categorias de Despesas no Período */}
      <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-[#34D399]" />
            <h3 className="text-sm font-bold text-[#F9FAFB]">
              Despesas por Categoria (
              {viewMode === 'month'
                ? `${MONTH_NAMES[selectedMonth]}/${selectedYear}`
                : `Ano ${selectedYear}`}
              )
            </h3>
          </div>
          <span className="text-xs text-[#9CA3AF] font-medium">
            {sortedCategoryExpenses.length} categorias com gastos
          </span>
        </div>

        {sortedCategoryExpenses.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] text-center py-6">
            Nenhuma despesa registrada para o período selecionado.
          </p>
        ) : (
          <div className="space-y-3">
            {sortedCategoryExpenses.map(item => (
              <div key={item.category.id} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[#F9FAFB] flex items-center">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: item.category.color }}
                    />
                    {item.category.name}
                  </span>
                  <span className="text-[#9CA3AF]">
                    <strong className="text-[#F9FAFB]">{formatBRL(item.amount)}</strong> ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, item.percentage)}%`,
                      backgroundColor: item.category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
