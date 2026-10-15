import React from 'react';
import { PeriodFilter } from '../types/finance';

interface PeriodFilterBarProps {
  currentFilter: PeriodFilter;
  onSelectFilter: (filter: PeriodFilter) => void;
}

export const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({
  currentFilter,
  onSelectFilter,
}) => {
  const filters: { id: PeriodFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'daily', label: 'Diariamente' },
    { id: 'weekly', label: 'Semanal' },
    { id: 'monthly', label: 'Mensal' },
  ];

  return (
    <div className="w-full px-3 py-1.5 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-2 min-w-max pb-0.5">
        {filters.map(item => {
          const isActive = currentFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectFilter(item.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 select-none ${
                isActive
                  ? 'bg-[#34D399] text-[#111827] font-bold shadow-xs border border-[#34D399]'
                  : 'bg-[#1F2937] text-[#9CA3AF] border border-[#374151] hover:bg-[#374151] hover:text-[#F9FAFB]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
