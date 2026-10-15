import React from 'react';
import { Account, Category, PeriodFilter } from '../types/finance';
import { EnrichedTransaction, groupTransactionsByDate } from '../utils/calculations';
import { formatBRL } from '../utils/currency';
import { formatDateWithWeekday, formatDateBR } from '../utils/date';
import { Inbox, ArrowRight } from 'lucide-react';

interface TransactionListProps {
  transactions: EnrichedTransaction[];
  previousBalanceInCents: number;
  categories: Category[];
  accounts?: Account[];
  periodFilter?: PeriodFilter;
  dailyIncomeInMonthCents?: number;
  dailyIncomeCountInMonth?: number;
  onNavigateToDaily?: () => void;
  onSelectTransaction: (tx: EnrichedTransaction) => void;
  onNewTransaction: (type?: 'income' | 'expense') => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  previousBalanceInCents,
  periodFilter,
  dailyIncomeInMonthCents = 0,
  dailyIncomeCountInMonth = 0,
  onNavigateToDaily,
  onSelectTransaction,
  onNewTransaction,
}) => {
  const isMonthly = periodFilter === 'monthly';

  // Na lista mensal: deixar uma única lista unificada sem separação por data
  const sortedMonthlyTransactions = isMonthly
    ? [...transactions].sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''))
    : [];

  // Nas demais listas (diariamente, semanal, etc.): agrupamento por data com divisores
  const grouped = !isMonthly ? groupTransactionsByDate(transactions, true) : [];

  // Renderizador padrão para cada linha de lançamento
  const renderRow = (tx: EnrichedTransaction, showDate: boolean) => {
    const isIncome = tx.type === 'income';

    return (
      <div
        key={tx.id}
        onClick={() => onSelectTransaction(tx)}
        className="grid grid-cols-12 items-center px-3.5 py-2.5 hover:bg-[#374151]/50 active:bg-[#374151] cursor-pointer transition-colors"
      >
        {/* Coluna 1: Descrição + Data/Horário */}
        <div className="col-span-6 min-w-0 pr-2">
          <div className="font-medium text-xs sm:text-sm text-[#F9FAFB] truncate leading-tight">
            {tx.description}
          </div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5 flex flex-wrap items-center gap-1.5">
            {showDate && <span>{formatDateBR(tx.date)}</span>}
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
            {tx.isFixed && (
              <span className="text-[9px] bg-[#064E3B] text-[#34D399] border border-[#34D399]/30 font-semibold px-1 rounded">
                Fixo Mensal
              </span>
            )}
            {tx.installmentNumber && (
              <span className="text-[9px] bg-[#111827] text-[#9CA3AF] border border-[#374151] font-semibold px-1 rounded">
                Parcela {tx.installmentNumber}/{tx.totalInstallments}
              </span>
            )}
            {!tx.isFixed && !tx.installmentNumber && (tx.periodScope === 'monthly' || !tx.periodScope) && (
              <span className="text-[9px] bg-[#111827] text-[#9CA3AF] border border-[#374151] font-semibold px-1 rounded">
                Mensal Único
              </span>
            )}
          </div>
        </div>

        {/* Coluna 2: Receita */}
        <div className="col-span-3 text-right font-bold text-xs sm:text-sm text-[#34D399] tabular-nums">
          {isIncome ? formatBRL(tx.amountInCents) : ''}
        </div>

        {/* Coluna 3: Despesa */}
        <div className="col-span-3 text-right font-bold text-xs sm:text-sm text-[#F87171] tabular-nums">
          {!isIncome ? formatBRL(tx.amountInCents) : ''}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1F2937] text-[#F9FAFB] overflow-hidden select-none">
      {/* Cabeçalho da Tabela com 3 colunas tradicionais de Livro Caixa */}
      <div className="bg-[#1F2937] border-b border-[#374151] px-3.5 py-2 z-10 shadow-2xs">
        <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          <div className="col-span-6 text-left">{isMonthly ? 'Descrição / Data' : 'Data / Descrição'}</div>
          <div className="col-span-3 text-right text-[#34D399]">Receita</div>
          <div className="col-span-3 text-right text-[#F87171]">Despesa</div>
        </div>
      </div>


      {/* Faixa Informativa: Receitas da lista diária calculadas na conta mensal para abater a dívida */}
      {periodFilter === 'monthly' && dailyIncomeInMonthCents > 0 && (
        <div className="bg-[#064E3B] border-b border-[#374151] px-3.5 py-2 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-[#34D399]">
            <span className="text-sm">💰</span>
            <div>
              <span className="font-bold">Receitas diárias na conta deste mês: </span>
              <span className="font-extrabold text-[#34D399]">{formatBRL(dailyIncomeInMonthCents)}</span>
              <span className="text-[11px] text-[#34D399]/80 block sm:inline sm:ml-1 font-medium">
                ({dailyIncomeCountInMonth} {dailyIncomeCountInMonth === 1 ? 'receita diária somada' : 'receitas diárias somadas'} para sua dívida)
              </span>
            </div>
          </div>
          {onNavigateToDaily && (
            <button
              onClick={onNavigateToDaily}
              className="flex items-center text-[11px] font-semibold text-[#34D399] hover:underline whitespace-nowrap ml-2"
            >
              <span>Ver Diárias</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </button>
          )}
        </div>
      )}

      {/* Lista Contínua de Movimentações */}
      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-[#111827] border border-[#374151] flex items-center justify-center text-[#9CA3AF] mb-2">
              <Inbox className="h-6 w-6 text-[#9CA3AF]" />
            </div>
            <p className="text-xs font-medium text-[#9CA3AF]">
              Nenhuma movimentação neste período.
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => onNewTransaction('income')}
                className="text-xs bg-[#064E3B] text-[#34D399] hover:bg-[#064E3B]/80 font-medium px-3 py-1 rounded-lg border border-[#34D399]/40 transition-colors"
              >
                + Receita
              </button>
              <button
                onClick={() => onNewTransaction('expense')}
                className="text-xs bg-[#7F1D1D]/40 text-[#F87171] hover:bg-[#7F1D1D]/60 font-medium px-3 py-1 rounded-lg border border-[#F87171]/40 transition-colors"
              >
                - Despesa
              </button>
            </div>
          </div>
        ) : isMonthly ? (
          /* Lista ÚNICA contínua sem separação por data (exclusivo para o Mensal) */
          <div className="divide-y divide-[#374151]">
            {sortedMonthlyTransactions.map(tx => renderRow(tx, true))}
          </div>
        ) : (
          /* Listas com agrupamento por dia (Diariamente, Semanal, etc.) */
          <div>
            {grouped.map(group => (
              <div key={group.dateStr}>
                {/* Divisor simples do Dia */}
                <div className="bg-[#111827] px-3.5 py-1.5 border-y border-[#374151] flex items-center justify-between text-[11px] font-semibold text-[#9CA3AF]">
                  <span>{formatDateWithWeekday(group.dateStr)}</span>
                  <span className="text-[10px] text-[#9CA3AF] font-normal">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Linhas de Lançamento Simplificadas */}
                <div className="divide-y divide-[#374151]">
                  {group.items.map(tx => renderRow(tx, false))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
