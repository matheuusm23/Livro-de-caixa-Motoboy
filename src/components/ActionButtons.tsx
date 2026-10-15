import React from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface ActionButtonsProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddIncome,
  onAddExpense,
}) => {
  return (
    <div className="w-full bg-[#111827] px-3 py-1.5 border-t border-[#374151] shadow-xs">
      <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
        {/* Botão RECEITA Compacto */}
        <button
          onClick={onAddIncome}
          aria-label="Registrar nova receita"
          className="h-10 bg-[#34D399] hover:bg-[#10B981] active:bg-[#059669] text-[#111827] rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all duration-150 active:scale-[0.98] select-none font-bold text-xs tracking-wider"
        >
          <PlusCircle className="h-4 w-4 text-[#111827] stroke-[2.5]" />
          <span>+ RECEITA</span>
        </button>

        {/* Botão DESPESA Compacto */}
        <button
          onClick={onAddExpense}
          aria-label="Registrar nova despesa"
          className="h-10 bg-[#F87171] hover:bg-[#EF4444] active:bg-[#DC2626] text-[#111827] rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all duration-150 active:scale-[0.98] select-none font-bold text-xs tracking-wider"
        >
          <MinusCircle className="h-4 w-4 text-[#111827] stroke-[2.5]" />
          <span>- DESPESA</span>
        </button>
      </div>
    </div>
  );
};
