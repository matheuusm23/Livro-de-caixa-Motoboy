import React from 'react';
import { FinancialSummaryData } from '../types/finance';
import { formatBRL } from '../utils/currency';
import { DailyRateBreakdown } from '../utils/calculations';

interface FinancialSummaryProps {
  summary: FinancialSummaryData;
  dailyRateInCents?: number;
  dailyRateBreakdown?: DailyRateBreakdown;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  summary,
  dailyRateInCents = 0,
  dailyRateBreakdown,
}) => {
  return (
    <div className="w-full bg-[#1F2937] border-t border-[#374151] shadow-md select-none">
      {/* 4 Colunas Principais: Total Receita | Total Despesa | Resultado | Diária */}
      <div className="grid grid-cols-4 divide-x divide-[#374151]">
        {/* COLUNA 1 — TOTAL RECEITA */}
        <div className="p-2 text-center flex flex-col justify-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#34D399] truncate">
            Receita
          </span>
          <span className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#34D399] truncate">
            {formatBRL(summary.periodIncomeInCents)}
          </span>
        </div>

        {/* COLUNA 2 — TOTAL DESPESA */}
        <div className="p-2 text-center flex flex-col justify-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#F87171] truncate">
            Despesa
          </span>
          <span className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#F87171] truncate">
            {formatBRL(summary.periodExpenseInCents)}
          </span>
        </div>

        {/* COLUNA 3 — RESULTADO */}
        <div className="p-2 text-center flex flex-col justify-center">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#F9FAFB] truncate">
            Resultado
          </span>
          <span
            className={`mt-0.5 text-xs sm:text-sm font-extrabold truncate ${
              summary.periodNetInCents >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
            }`}
          >
            {formatBRL(summary.periodNetInCents)}
          </span>
        </div>

        {/* COLUNA 4 — DIÁRIA (RECALCULADA DINAMICAMENTE) */}
        <div className="p-2 text-center flex flex-col justify-center bg-[#064E3B]/20">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#34D399] truncate">
              Diária
            </span>
            {dailyRateBreakdown?.status === 'compensated' && (
              <span className="text-[9px] font-bold px-1 rounded bg-[#064E3B] text-[#34D399] border border-[#34D399]/40" title="Diária diminuída porque você compensou!">
                ↓
              </span>
            )}
            {dailyRateBreakdown?.status === 'deficit' && (
              <span className="text-[9px] font-bold px-1 rounded bg-[#7F1D1D] text-[#F87171] border border-[#F87171]/40" title="Diária aumentada para compensar dias menores">
                ↑
              </span>
            )}
            {dailyRateBreakdown?.status === 'completed' && (
              <span className="text-[9px] font-bold px-1 rounded bg-[#064E3B] text-[#34D399] border border-[#34D399]/40" title="Despesas 100% cobertas!">
                ✓
              </span>
            )}
          </div>
          <span className="mt-0.5 text-xs sm:text-sm font-extrabold text-[#34D399] truncate">
            {formatBRL(dailyRateInCents)}
          </span>
          {dailyRateBreakdown && dailyRateBreakdown.daysWorkedCount > 0 && dailyRateBreakdown.remainingWorkDays > 0 && (
            <span className="text-[9px] text-[#9CA3AF] truncate leading-none mt-0.5">
              {dailyRateBreakdown.remainingWorkDays}d restantes
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
