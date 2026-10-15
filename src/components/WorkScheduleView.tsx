import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Coffee,
  Briefcase,
  Calculator,
  Check,
  RotateCcw,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatBRL } from '../utils/currency';
import { computeDailyRateBreakdown } from '../utils/calculations';
import { toISODateString } from '../utils/date';

interface WorkScheduleViewProps {
  currentDate: Date;
  onChangeDate: (date: Date) => void;
  offDays: string[];
  onToggleOffDay: (dateStr: string) => void;
  onSetMultipleOffDays: (dates: string[]) => void;
  transactions: Transaction[];
  onBackToLivro: () => void;
  onLaunchDailyRate?: (dateStr: string, suggestedAmountInCents: number) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const WorkScheduleView: React.FC<WorkScheduleViewProps> = ({
  currentDate,
  onChangeDate,
  offDays,
  onToggleOffDay,
  onSetMultipleOffDays,
  transactions,
  onBackToLivro,
  onLaunchDailyRate,
}) => {
  const [selectedDayForAction, setSelectedDayForAction] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Dias do mês
  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0);
  const totalDaysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Cálculo completo e inteligente da diária
  const breakdown = computeDailyRateBreakdown(transactions, offDays, year, month);

  // Mapeamento de receitas por dia para exibição rápida no calendário
  const dailyIncomeMap = new Map<string, number>();
  transactions
    .filter(t => t.type === 'income' && t.date.startsWith(monthPrefix))
    .forEach(t => {
      const current = dailyIncomeMap.get(t.date) || 0;
      dailyIncomeMap.set(t.date, current + t.amountInCents);
    });

  // Navegar mês
  const handlePrevMonth = () => {
    onChangeDate(new Date(year, month - 1, 1, 12, 0, 0));
  };

  const handleNextMonth = () => {
    onChangeDate(new Date(year, month + 1, 1, 12, 0, 0));
  };

  // Marcar todos os sábados e domingos do mês como folga
  const handleMarkWeekends = () => {
    const weekendDates: string[] = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(year, month, day, 12, 0, 0);
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDates.push(`${monthPrefix}-${String(day).padStart(2, '0')}`);
      }
    }
    const otherMonthsOffDays = offDays.filter(d => !d.startsWith(monthPrefix));
    onSetMultipleOffDays([...otherMonthsOffDays, ...weekendDates]);
  };

  // Limpar folgas do mês
  const handleClearMonthOffDays = () => {
    const otherMonthsOffDays = offDays.filter(d => !d.startsWith(monthPrefix));
    onSetMultipleOffDays(otherMonthsOffDays);
  };

  // Dias vazios para preenchimento da primeira semana
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const todayStr = toISODateString(new Date(2026, 9, 10, 12, 0, 0));

  return (
    <div className="flex-1 overflow-y-auto bg-[#111827] p-3 sm:p-5 space-y-4">
      {/* Barra de Ações Superior */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLivro}
          className="flex items-center text-xs font-semibold px-3 py-1.5 bg-[#1F2937] border border-[#374151] text-[#34D399] rounded-lg shadow-2xs hover:bg-[#374151] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar ao Livro Caixa
        </button>

        {onLaunchDailyRate && (
          <button
            onClick={() =>
              onLaunchDailyRate(
                todayStr.startsWith(monthPrefix) ? todayStr : `${monthPrefix}-01`,
                breakdown.recalculatedDailyRateInCents || breakdown.baseDailyRateInCents
              )
            }
            className="flex items-center text-xs font-bold px-3.5 py-1.5 bg-[#34D399] hover:bg-[#10B981] active:bg-[#059669] text-[#111827] rounded-lg shadow-xs transition-all"
          >
            <PlusCircle className="h-4 w-4 mr-1.5 stroke-[2.5]" />
            Lançar Diária de Hoje
          </button>
        )}
      </div>

      {/* Navegador de Mês */}
      <div className="bg-[#1F2937] text-[#F9FAFB] border border-[#374151] p-3 rounded-2xl shadow-sm flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#374151] active:bg-[#374151]/80 text-[#34D399]"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-[#34D399]" />
          <h2 className="text-base font-bold tracking-wide text-[#F9FAFB]">
            {MONTH_NAMES[month]} de {year}
          </h2>
        </div>

        <button
          onClick={handleNextMonth}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#374151] active:bg-[#374151]/80 text-[#34D399]"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Cartão de Destaque da Diária Inteligente Recalculada */}
      <div className="bg-[#1F2937] text-[#F9FAFB] rounded-2xl border-2 border-[#34D399] shadow-sm p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#34D399] bg-[#064E3B] border border-[#34D399]/40 px-2 py-0.5 rounded-md">
                Diária dos Próximos Dias
              </span>
              {breakdown.status === 'compensated' && (
                <span className="inline-flex items-center text-[11px] font-bold text-[#34D399] bg-[#064E3B] border border-[#34D399]/40 px-2 py-0.5 rounded-md">
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  Compensou! Valor reduzido
                </span>
              )}
              {breakdown.status === 'deficit' && (
                <span className="inline-flex items-center text-[11px] font-bold text-[#F87171] bg-[#7F1D1D] border border-[#F87171]/40 px-2 py-0.5 rounded-md">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Fez a menos. Diária aumentada
                </span>
              )}
              {breakdown.status === 'completed' && (
                <span className="inline-flex items-center text-[11px] font-bold text-[#34D399] bg-[#064E3B] border border-[#34D399]/40 px-2 py-0.5 rounded-md">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Meta de despesas 100% coberta!
                </span>
              )}
            </div>

            <div className="flex items-baseline space-x-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#34D399] tracking-tight">
                {formatBRL(breakdown.recalculatedDailyRateInCents)}
              </span>
              <span className="text-xs sm:text-sm text-[#9CA3AF]">
                / dia de trabalho
              </span>
            </div>

            {/* Explicação da Variação Dinâmica */}
            <div className="text-xs text-[#9CA3AF] pt-1">
              {breakdown.status === 'compensated' && (
                <p className="text-[#34D399] font-medium">
                  Você faturou a mais que o previsto. Suas próximas diárias caíram{' '}
                  <strong className="text-[#F9FAFB]">{formatBRL(Math.abs(breakdown.differencePerDayInCents))}</strong> por dia para compensar o saldo positivo!
                </p>
              )}
              {breakdown.status === 'deficit' && (
                <p className="text-[#F87171] font-medium">
                  Você faturou a menos que o previsto. Suas próximas diárias subiram{' '}
                  <strong className="text-[#F9FAFB]">{formatBRL(breakdown.differencePerDayInCents)}</strong> por dia para não deixar pendência de despesas!
                </p>
              )}
              {breakdown.status === 'normal' && (
                <p className="text-[#9CA3AF]">
                  Diária base calculada a partir de {formatBRL(breakdown.monthlyExpensesInCents)} em despesas ÷ {breakdown.totalWorkDays} dias de trabalho.
                </p>
              )}
              {breakdown.status === 'completed' && (
                <p className="text-[#34D399] font-semibold">
                  Parabéns! Todas as despesas de {formatBRL(breakdown.monthlyExpensesInCents)} deste mês já foram 100% pagas pelas receitas realizadas.
                </p>
              )}
            </div>
          </div>

          {/* Comparativo: Prevista Inicial vs Realizada */}
          <div className="bg-[#111827] rounded-xl p-3 border border-[#374151] min-w-[200px] space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[#9CA3AF]">
              <span>Diária prevista inicial:</span>
              <strong className="text-[#F9FAFB]">{formatBRL(breakdown.baseDailyRateInCents)}</strong>
            </div>
            <div className="flex justify-between items-center text-[#9CA3AF]">
              <span>Despesas do mês:</span>
              <strong className="text-[#F87171]">{formatBRL(breakdown.monthlyExpensesInCents)}</strong>
            </div>
            <div className="flex justify-between items-center text-[#9CA3AF]">
              <span>Receitas realizadas:</span>
              <strong className="text-[#34D399]">{formatBRL(breakdown.monthlyIncomeInCents)}</strong>
            </div>
            <div className="border-t border-[#374151] pt-1 flex justify-between items-center font-bold">
              <span className="text-[#9CA3AF]">Falta cobrir:</span>
              <span className="text-[#34D399]">
                {formatBRL(breakdown.remainingExpensesInCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cartões de Indicadores: Folgas e Dias Trabalhados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dias de Folga */}
        <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151] shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#111827] border border-[#374151] text-[#9CA3AF] shrink-0">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              Dias de Folga
            </span>
            <div className="text-2xl font-black text-[#F9FAFB]">
              {breakdown.offDaysCount} <span className="text-xs font-semibold text-[#9CA3AF]">{breakdown.offDaysCount === 1 ? 'dia' : 'dias'}</span>
            </div>
            <span className="text-[10px] text-[#9CA3AF]">Toque no calendário para marcar/desmarcar</span>
          </div>
        </div>

        {/* Dias de Trabalho (Total, Realizados e Restantes) */}
        <div className="bg-[#1F2937] p-4 rounded-xl border border-[#374151] shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-[#064E3B] border border-[#34D399]/30 text-[#34D399] shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              Dias Trabalhados
            </span>
            <div className="text-2xl font-black text-[#34D399]">
              {breakdown.totalWorkDays} <span className="text-xs font-semibold text-[#9CA3AF]">{breakdown.totalWorkDays === 1 ? 'dia' : 'dias planejados'}</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-[#9CA3AF] mt-0.5">
              <span className="bg-[#064E3B] text-[#34D399] border border-[#34D399]/30 px-1.5 py-0.5 rounded font-semibold">
                {breakdown.daysWorkedCount} {breakdown.daysWorkedCount === 1 ? 'dia realizado' : 'dias realizados'}
              </span>
              <span>•</span>
              <span className="bg-[#111827] text-[#9CA3AF] border border-[#374151] px-1.5 py-0.5 rounded font-semibold">
                {breakdown.remainingWorkDays} {breakdown.remainingWorkDays === 1 ? 'dia restante' : 'dias restantes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário Interativo */}
      <div className="bg-[#1F2937] text-[#F9FAFB] rounded-2xl border border-[#374151] shadow-xs p-3.5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#F9FAFB]">
              Calendário de Escala & Diárias
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Toque no dia para alternar entre <strong>Trabalho</strong> e <strong>Folga</strong>. Dias com receita lançada exibem o valor ganho.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkWeekends}
              className="text-[11px] font-semibold px-2.5 py-1 bg-[#111827] text-[#9CA3AF] border border-[#374151] rounded-lg hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
            >
              Marcar Sáb/Dom como Folga
            </button>
            <button
              onClick={handleClearMonthOffDays}
              className="text-[11px] font-semibold px-2.5 py-1 bg-[#111827] text-[#9CA3AF] border border-[#374151] rounded-lg hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
            >
              <RotateCcw className="h-3 w-3 inline mr-1" />
              Limpar Folgas
            </button>
          </div>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-[#9CA3AF] py-2 border-b border-[#374151]">
          {WEEKDAY_NAMES.map((name, i) => (
            <div key={name} className={i === 0 || i === 6 ? 'text-[#F87171]' : ''}>
              {name}
            </div>
          ))}
        </div>

        {/* Grade do Calendário */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
          {/* Espaços vazios do início do mês */}
          {emptyDays.map(emptyIndex => (
            <div key={`empty-${emptyIndex}`} className="min-h-[5rem] sm:min-h-[5.5rem] bg-transparent rounded-xl" />
          ))}

          {/* Dias do mês */}
          {monthDays.map(dayNum => {
            const dateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
            const isOff = offDays.includes(dateStr);
            const isToday = dateStr === todayStr;
            const dayIncome = dailyIncomeMap.get(dateStr) || 0;
            const hasIncome = dayIncome > 0;

            return (
              <div
                key={dateStr}
                onClick={() => onToggleOffDay(dateStr)}
                className={`min-h-[5rem] sm:min-h-[5.5rem] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between items-center transition-all duration-150 select-none cursor-pointer ${
                  isOff
                    ? 'bg-[#111827] border-[#374151] text-[#9CA3AF] shadow-2xs hover:bg-[#374151]/50'
                    : hasIncome
                    ? 'bg-[#064E3B]/40 border-[#34D399]/50 text-[#34D399] hover:bg-[#064E3B]/60'
                    : 'bg-[#1F2937] border-[#374151] text-[#F9FAFB] hover:bg-[#374151]/50 active:bg-[#374151]'
                } ${isToday ? 'ring-2 ring-[#34D399] ring-offset-1 ring-offset-[#1F2937]' : ''}`}
              >
                {/* Cabeçalho do dia */}
                <div className="w-full flex justify-between items-center text-[10px] sm:text-xs leading-none">
                  <span
                    className={`font-bold ${
                      isOff ? 'text-[#9CA3AF]' : hasIncome ? 'text-[#34D399]' : 'text-[#F9FAFB]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[7.5px] sm:text-[8px] font-bold text-[#111827] bg-[#34D399] px-1 py-0.2 rounded leading-none">
                      Hoje
                    </span>
                  )}
                </div>

                {/* Conteúdo do dia: Folga, Ganho Realizado ou Trabalho Previsto */}
                <div className="w-full flex flex-col items-center justify-center my-0.5 text-center">
                  {isOff ? (
                    <span className="inline-block text-[8px] sm:text-[9px] font-bold bg-[#374151] text-[#9CA3AF] px-1.5 py-0.5 rounded leading-none shadow-2xs">
                      Folga
                    </span>
                  ) : hasIncome ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="text-[8.5px] sm:text-[10px] font-black text-[#34D399] leading-tight break-words text-center px-0.5">
                        {formatBRL(dayIncome)}
                      </div>
                      <span className="inline-block text-[7.5px] sm:text-[8px] font-bold bg-[#064E3B] text-[#34D399] border border-[#34D399]/40 px-1 py-0.2 rounded mt-0.5 leading-none">
                        Ganho
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <span className="text-[7.5px] sm:text-[8.5px] text-[#9CA3AF] font-medium leading-none mb-0.5">
                        Trabalho
                      </span>
                      <div className="text-[8px] sm:text-[9.5px] font-extrabold text-[#34D399] leading-tight break-words text-center px-0.5">
                        {formatBRL(breakdown.recalculatedDailyRateInCents || breakdown.baseDailyRateInCents)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão rápido para lançar diária neste dia específico se for trabalho */}
                {!isOff && onLaunchDailyRate && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onLaunchDailyRate(
                        dateStr,
                        breakdown.recalculatedDailyRateInCents || breakdown.baseDailyRateInCents
                      );
                    }}
                    className="w-full text-[7.5px] sm:text-[8.5px] text-[#34D399] hover:underline font-semibold text-center leading-none py-0.5 opacity-90 hover:opacity-100"
                    title="Lançar receita nesta data"
                  >
                    + Lançar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explicação Didática da Diária e Recálculo */}
      <div className="p-4 bg-[#1F2937] rounded-xl border border-[#374151] text-xs text-[#9CA3AF] space-y-2">
        <p className="font-bold text-[#F9FAFB] flex items-center">
          <Info className="h-4 w-4 text-[#34D399] mr-1.5 shrink-0" />
          Como funciona o recálculo automático da sua diária?
        </p>
        <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-[#9CA3AF]">
          <li>
            <strong className="text-[#F9FAFB]">Diária prevista inicial:</strong> É o total das despesas do mês ({formatBRL(breakdown.monthlyExpensesInCents)}) dividido pelos {breakdown.totalWorkDays} dias de trabalho planejados.
          </li>
          <li>
            <strong className="text-[#F9FAFB]">Se você fizer A MAIS que o previsto:</strong> O dinheiro extra compensa as despesas com antecedência, fazendo com que o valor das suas <strong className="text-[#34D399]">próximas diárias diminua</strong>.
          </li>
          <li>
            <strong className="text-[#F9FAFB]">Se você fizer A MENOS que o previsto:</strong> A diferença que faltou é distribuída automaticamente entre os dias restantes de trabalho, fazendo com que as <strong className="text-[#F87171]">próximas diárias aumentem</strong> para cobrir a meta.
          </li>
        </ul>
      </div>
    </div>
  );
};
