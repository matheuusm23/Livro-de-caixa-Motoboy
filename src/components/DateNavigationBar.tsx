import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PeriodFilter } from '../types/finance';

interface DateNavigationBarProps {
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  periodFilter: PeriodFilter;
}

export const DateNavigationBar: React.FC<DateNavigationBarProps> = ({
  dateLabel,
  onPrev,
  onNext,
  onToday,
  periodFilter,
}) => {
  const isAll = periodFilter === 'all';

  return (
    <div className="w-full bg-[#111827] text-[#F9FAFB] border-b border-[#374151] shadow-xs select-none">
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={onPrev}
          disabled={isAll}
          aria-label="Período anterior"
          className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#374151] active:bg-[#374151]/80 transition-colors ${
            isAll ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="h-6 w-6 text-[#34D399]" />
        </button>

        <div className="flex items-center space-x-1.5 text-center px-2">
          <Calendar className="h-4 w-4 text-[#34D399] shrink-0" />
          <span className="text-sm font-semibold tracking-wide text-[#F9FAFB] font-['Roboto',sans-serif] drop-shadow-xs">
            {dateLabel}
          </span>
          {!isAll && (
            <button
              onClick={onToday}
              title="Ir para hoje"
              className="ml-2 text-[10px] bg-[#064E3B] hover:bg-[#064E3B]/80 border border-[#34D399]/40 px-1.5 py-0.5 rounded font-medium text-[#34D399] transition-colors"
            >
              Hoje
            </button>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={isAll}
          aria-label="Próximo período"
          className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#374151] active:bg-[#374151]/80 transition-colors ${
            isAll ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronRight className="h-6 w-6 text-[#34D399]" />
        </button>
      </div>
    </div>
  );
};
