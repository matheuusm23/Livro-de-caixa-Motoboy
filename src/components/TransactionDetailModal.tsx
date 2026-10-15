import React, { useState } from 'react';
import { X, Edit2, Trash2, Calendar, Tag, Wallet, AlignLeft, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { Account, Category } from '../types/finance';
import { EnrichedTransaction } from '../utils/calculations';
import { formatBRL } from '../utils/currency';
import { formatDateBR } from '../utils/date';

interface TransactionDetailModalProps {
  transaction: EnrichedTransaction | null;
  onClose: () => void;
  onEdit: (tx: EnrichedTransaction) => void;
  onDelete: (id: string) => void;
  categories: Category[];
  accounts?: Account[];
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
  categories,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const category = categories.find(c => c.id === transaction.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Card de Detalhes */}
      <div className="relative w-full max-w-sm bg-[#1F2937] text-[#F9FAFB] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div
          className={`p-4 transition-colors flex items-center justify-between border-b border-[#374151] ${
            isIncome ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#7F1D1D] text-[#F87171]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isIncome ? <ArrowUpRight className="h-6 w-6 text-[#34D399]" /> : <ArrowDownRight className="h-6 w-6 text-[#F87171]" />}
            <span className="font-bold text-sm uppercase tracking-wider">
              {isIncome ? 'Receita' : 'Despesa'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-inherit"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informações Principais */}
        <div className="p-4 space-y-4">
          <div className="text-center pb-2 border-b border-[#374151]">
            <h3 className="text-base font-bold text-[#F9FAFB]">
              {transaction.description}
            </h3>
            <div
              className={`text-2xl font-extrabold mt-1 ${
                isIncome ? 'text-[#34D399]' : 'text-[#F87171]'
              }`}
            >
              {isIncome ? '+' : '-'} {formatBRL(transaction.amountInCents)}
            </div>
          </div>

          {/* Atributos */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#9CA3AF] flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[#9CA3AF]" />
                Data
              </span>
              <span className="font-semibold text-[#F9FAFB]">
                {formatDateBR(transaction.date)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#9CA3AF] flex items-center">
                <Tag className="h-4 w-4 mr-2 text-[#9CA3AF]" />
                Categoria
              </span>
              <span className="font-semibold text-[#F9FAFB]">
                {category?.name || 'Sem categoria'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#9CA3AF]">Destino / Página</span>
              <span className="font-semibold text-[#34D399] bg-[#064E3B] border border-[#34D399]/30 px-2 py-0.5 rounded text-[11px]">
                {transaction.periodScope === 'daily'
                  ? 'Diariamente'
                  : transaction.periodScope === 'weekly'
                  ? 'Semanal'
                  : 'Mensal'}
              </span>
            </div>

            {transaction.recurrenceType === 'installment' && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[#9CA3AF]">Parcelamento</span>
                <span className="font-semibold text-[#F9FAFB] bg-[#111827] border border-[#374151] px-2 py-0.5 rounded text-[11px]">
                  Parcela {transaction.installmentNumber} de {transaction.totalInstallments}
                </span>
              </div>
            )}

            {transaction.isFixed && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[#9CA3AF]">Frequência</span>
                <span className="font-semibold text-[#34D399] bg-[#064E3B] border border-[#34D399]/30 px-2 py-0.5 rounded text-[11px]">
                  Lançamento Fixo Mensal
                </span>
              </div>
            )}

            {transaction.notes && (
              <div className="pt-2 border-t border-[#374151]">
                <span className="text-[#9CA3AF] flex items-center mb-1">
                  <AlignLeft className="h-4 w-4 mr-2 text-[#9CA3AF]" />
                  Observações
                </span>
                <p className="p-2 rounded-lg bg-[#111827] text-[#F9FAFB] border border-[#374151] leading-relaxed">
                  {transaction.notes}
                </p>
              </div>
            )}
          </div>

          {/* Confirmação de exclusão ou botões de ação */}
          {showConfirmDelete ? (
            <div className="p-3 bg-[#7F1D1D]/30 rounded-xl border border-[#F87171]/40 text-center space-y-2">
              <div className="flex items-center justify-center text-[#F87171] space-x-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold">Excluir lançamento?</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Esta ação é irreversível e os saldos posteriores serão recalculados automaticamente.
              </p>
              <div className="flex justify-center space-x-2 pt-1">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#374151] bg-[#111827] text-[#9CA3AF] font-medium hover:bg-[#374151] hover:text-[#F9FAFB]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDelete(transaction.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-[#F87171] text-[#111827] font-bold shadow-xs hover:bg-[#EF4444]"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pt-2 border-t border-[#374151]">
              <button
                onClick={() => {
                  onEdit(transaction);
                  onClose();
                }}
                className="flex-1 py-2 rounded-xl bg-[#34D399] text-[#111827] text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs hover:bg-[#10B981] transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="py-2 px-3 rounded-xl border border-[#F87171] text-[#F87171] hover:bg-[#7F1D1D]/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
