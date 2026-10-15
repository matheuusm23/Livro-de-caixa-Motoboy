import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Calendar, Tag, AlignLeft, Repeat, Layers, Plus, Check } from 'lucide-react';
import { Account, Category, PeriodScope, Transaction, TransactionType } from '../types/finance';
import { maskCurrencyInput, parseBRLToCents } from '../utils/currency';
import { addMonthsToDate, getCurrentTimeString, toISODateString } from '../utils/date';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> | Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[],
    editId?: string
  ) => void;
  initialType?: TransactionType;
  initialPeriodScope?: PeriodScope;
  editingTransaction?: Transaction | null;
  categories: Category[];
  accounts?: Account[];
  onOpenAddCategory?: (type: TransactionType) => void;
  defaultValues?: {
    date?: string;
    amountInCents?: number;
    description?: string;
    periodScope?: PeriodScope;
  };
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'income',
  initialPeriodScope = 'monthly',
  editingTransaction,
  categories,
  onOpenAddCategory,
  defaultValues,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('0,00');
  const [date, setDate] = useState(toISODateString(new Date()));
  const [time, setTime] = useState(getCurrentTimeString());
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escopo de Período: Diariamente, Semanal, Mensal
  const [periodScope, setPeriodScope] = useState<PeriodScope>(initialPeriodScope);

  // Recorrência e Parcelamento (exclusivo do Mensal)
  const [recurrenceType, setRecurrenceType] = useState<'single' | 'installment' | 'fixed'>('single');
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);
  const [fixedMonthsCount, setFixedMonthsCount] = useState<number>(12);

  // Filtra categorias pelo tipo selecionado
  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      const reais = (editingTransaction.amountInCents / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setAmountStr(reais);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTimeString());
      setCategoryId(editingTransaction.categoryId);
      setNotes(editingTransaction.notes || '');
      setPeriodScope(editingTransaction.periodScope || 'monthly');
      setRecurrenceType(editingTransaction.recurrenceType || 'single');
      setInstallmentsCount(editingTransaction.totalInstallments || 3);
    } else {
      setType(initialType);
      setDescription(defaultValues?.description || '');
      const initialAmountStr = defaultValues?.amountInCents
        ? (defaultValues.amountInCents / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '0,00';
      setAmountStr(initialAmountStr);
      setDate(defaultValues?.date || toISODateString(new Date()));
      setTime(getCurrentTimeString());
      setNotes('');
      setPeriodScope(defaultValues?.periodScope || initialPeriodScope || 'monthly');
      setRecurrenceType('single');
      setInstallmentsCount(3);
      setFixedMonthsCount(12);

      // Auto-seleciona a primeira categoria
      const matchingCats = categories.filter(c => c.type === initialType);
      if (matchingCats.length > 0) {
        setCategoryId(matchingCats[0].id);
      }
    }
    setErrors({});
    setIsSubmitting(false);
  }, [editingTransaction, initialType, initialPeriodScope, isOpen, categories, defaultValues]);

  // Se o tipo mudar, atualiza a categoria se a atual não pertencer ao novo tipo
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newFiltered = categories.filter(c => c.type === newType);
    if (!newFiltered.some(c => c.id === categoryId) && newFiltered.length > 0) {
      setCategoryId(newFiltered[0].id);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCurrencyInput(e.target.value);
    setAmountStr(masked);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Informe a descrição do lançamento.';
    }

    const cents = parseBRLToCents(amountStr);
    if (cents <= 0) {
      newErrors.amount = 'O valor deve ser maior que R$ 0,00.';
    }

    if (!date) {
      newErrors.date = 'Informe a data.';
    }

    if (!categoryId) {
      newErrors.category = 'Selecione uma categoria válida.';
    }

    if (periodScope === 'monthly' && recurrenceType === 'installment' && (!installmentsCount || installmentsCount < 2)) {
      newErrors.installments = 'Informe no mínimo 2 parcelas.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingTransaction) {
        // Editando lançamento existente
        onSave(
          {
            type,
            description: description.trim(),
            amountInCents: cents,
            date,
            time: time || '12:00',
            categoryId,
            notes: notes.trim() || undefined,
            periodScope,
            recurrenceType: periodScope === 'monthly' ? recurrenceType : 'single',
            installmentNumber: editingTransaction.installmentNumber,
            totalInstallments: editingTransaction.totalInstallments,
            parentId: editingTransaction.parentId,
            isFixed: periodScope === 'monthly' && recurrenceType === 'fixed',
          },
          editingTransaction.id
        );
      } else if (periodScope === 'monthly' && recurrenceType === 'installment') {
        // Criar série parcelada nos próximos meses (aparece somente no mensal)
        const parentId = `rec_${Date.now()}`;
        const count = Math.min(60, Math.max(2, installmentsCount));
        const batch: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        for (let i = 1; i <= count; i++) {
          const installmentDate = addMonthsToDate(date, i - 1);
          batch.push({
            type,
            description: `${description.trim()} (${i}/${count})`,
            amountInCents: cents,
            date: installmentDate,
            time: time || '12:00',
            categoryId,
            notes: notes.trim() ? `${notes.trim()} (Parcela ${i}/${count})` : undefined,
            periodScope: 'monthly',
            recurrenceType: 'installment',
            installmentNumber: i,
            totalInstallments: count,
            parentId,
          });
        }
        onSave(batch);
      } else if (periodScope === 'monthly' && recurrenceType === 'fixed') {
        // Criar lançamentos fixos mensais nos próximos meses (aparece somente no mensal)
        const parentId = `fix_${Date.now()}`;
        const count = Math.min(36, Math.max(2, fixedMonthsCount));
        const batch: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        for (let i = 1; i <= count; i++) {
          const targetDate = addMonthsToDate(date, i - 1);
          batch.push({
            type,
            description: description.trim(),
            amountInCents: cents,
            date: targetDate,
            time: time || '12:00',
            categoryId,
            notes: notes.trim() ? `${notes.trim()} [Fixa Mensal]` : undefined,
            periodScope: 'monthly',
            recurrenceType: 'fixed',
            isFixed: true,
            parentId,
          });
        }
        onSave(batch);
      } else {
        // Lançamento Único regular com escopo específico
        onSave({
          type,
          description: description.trim(),
          amountInCents: cents,
          date,
          time: time || '12:00',
          categoryId,
          notes: notes.trim() || undefined,
          periodScope,
          recurrenceType: 'single',
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isIncome = type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full sm:max-w-md bg-[#1F2937] text-[#F9FAFB] border border-[#374151] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-250">
        {/* Cabeçalho do Modal */}
        <div
          className={`p-4 rounded-t-2xl transition-colors flex items-center justify-between border-b border-[#374151] ${
            isIncome ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#7F1D1D] text-[#F87171]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isIncome ? <ArrowUpRight className="h-6 w-6 text-[#34D399]" /> : <ArrowDownRight className="h-6 w-6 text-[#F87171]" />}
            <h2 className="text-lg font-bold">
              {editingTransaction
                ? `Editar ${isIncome ? 'Receita' : 'Despesa'}`
                : `Nova ${isIncome ? 'Receita' : 'Despesa / Dívida'}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-inherit transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alternador de Tipo de Lançamento */}
        <div className="p-3 bg-[#111827] border-b border-[#374151]">
          <div className="grid grid-cols-2 gap-2 bg-[#1F2937] p-1 rounded-xl border border-[#374151]">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                isIncome
                  ? 'bg-[#34D399] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Receita (+)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                !isIncome
                  ? 'bg-[#F87171] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>Despesa / Dívida (-)</span>
            </button>
          </div>
        </div>

        {/* Formulário com rolagem */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Valor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              {recurrenceType === 'installment' ? 'Valor de Cada Parcela *' : 'Valor *'}
            </label>
            <div className="relative rounded-xl border border-[#374151] focus-within:border-[#34D399] focus-within:ring-2 focus-within:ring-[#34D399]/20 bg-[#111827] px-3 py-2">
              <span className="text-xs font-bold text-[#9CA3AF] mr-1.5">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0,00"
                className={`w-full text-2xl font-bold tracking-tight outline-none bg-transparent ${
                  isIncome ? 'text-[#34D399]' : 'text-[#F87171]'
                }`}
                autoFocus={!editingTransaction}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-[#F87171] font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              Descrição *
            </label>
            <input
              type="text"
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="Ex: Empréstimo, Cartão, Aluguel, Supermercado..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#374151] bg-[#111827] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 outline-none text-[#F9FAFB] placeholder-[#6B7280]"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#F87171] font-medium">{errors.description}</p>
            )}
          </div>

          {/* Opção de Destino / Periodicidade do Lançamento */}
          <div className="p-3 rounded-xl border border-[#374151] bg-[#111827] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#34D399]" />
                Destino / Periodicidade
              </span>
            </div>

            {/* 3 Botões Principais: Diariamente | Semanal | Mensal */}
            <div className="grid grid-cols-3 gap-1.5 bg-[#1F2937] p-1 rounded-lg border border-[#374151]">
              <button
                type="button"
                onClick={() => setPeriodScope('daily')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  periodScope === 'daily'
                    ? 'bg-[#34D399] text-[#111827] shadow-xs'
                    : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                }`}
              >
                Diariamente
              </button>
              <button
                type="button"
                onClick={() => setPeriodScope('weekly')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  periodScope === 'weekly'
                    ? 'bg-[#34D399] text-[#111827] shadow-xs'
                    : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                }`}
              >
                Semanal
              </button>
              <button
                type="button"
                onClick={() => setPeriodScope('monthly')}
                className={`py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  periodScope === 'monthly'
                    ? 'bg-[#34D399] text-[#111827] shadow-xs'
                    : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                }`}
              >
                Mensal
              </button>
            </div>

            {/* Explicação Diariamente */}
            {periodScope === 'daily' && (
              <div className="p-2 rounded-lg bg-[#064E3B] text-[11px] text-[#34D399] border border-[#34D399]/40 leading-snug animate-in fade-in duration-150">
                {isIncome ? (
                  <span>
                    💰 <strong>Receita Diária:</strong> Aparece na lista <strong>Diariamente</strong> e <strong>calcula na conta mensal</strong> para abater sua dívida e recalcular sua diária.
                  </span>
                ) : (
                  <span>
                    📌 <strong>Despesa Diária:</strong> Aparecerá exclusivamente na lista <strong>Diariamente</strong> e não aparecerá no mensal.
                  </span>
                )}
              </div>
            )}

            {/* Explicação Semanal */}
            {periodScope === 'weekly' && (
              <div className="p-2 rounded-lg bg-[#1F2937] text-[11px] text-[#9CA3AF] border border-[#374151] leading-snug animate-in fade-in duration-150">
                📌 <strong>Lançamento Semanal:</strong> Aparecerá exclusivamente na página <strong>Semanal</strong> e <em>não aparecerá no mensal</em>.
              </div>
            )}

            {/* Configuração do Mensal (Único, Parcelado ou Fixo) */}
            {periodScope === 'monthly' && (
              <div className="pt-1 space-y-2 animate-in fade-in duration-150">
                {!editingTransaction && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#9CA3AF]">
                        Tipo de Lançamento Mensal:
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 bg-[#1F2937] p-1 rounded-lg border border-[#374151]">
                      <button
                        type="button"
                        onClick={() => setRecurrenceType('single')}
                        className={`py-1 text-[11px] font-bold rounded-md transition-colors ${
                          recurrenceType === 'single'
                            ? 'bg-[#34D399] text-[#111827] shadow-xs'
                            : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                        }`}
                      >
                        Único
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurrenceType('installment')}
                        className={`py-1 text-[11px] font-bold rounded-md transition-colors ${
                          recurrenceType === 'installment'
                            ? 'bg-[#34D399] text-[#111827] shadow-xs'
                            : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                        }`}
                      >
                        Parcelado
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurrenceType('fixed')}
                        className={`py-1 text-[11px] font-bold rounded-md transition-colors ${
                          recurrenceType === 'fixed'
                            ? 'bg-[#34D399] text-[#111827] shadow-xs'
                            : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
                        }`}
                      >
                        Fixo Mensal
                      </button>
                    </div>

                    {/* Configuração de Parcelamento */}
                    {recurrenceType === 'installment' && (
                      <div className="pt-1 space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#9CA3AF]">
                            Número de Parcelas (Meses):
                          </label>
                          <div className="flex items-center space-x-1">
                            {[2, 3, 6, 10, 12].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setInstallmentsCount(n)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                  installmentsCount === n
                                    ? 'bg-[#34D399] text-[#111827] border-[#34D399]'
                                    : 'bg-[#1F2937] text-[#9CA3AF] border-[#374151]'
                                }`}
                              >
                                {n}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min={2}
                            max={60}
                            value={installmentsCount}
                            onChange={e => setInstallmentsCount(parseInt(e.target.value, 10) || 2)}
                            className="w-20 px-2 py-1 text-xs border border-[#374151] rounded-lg bg-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#34D399] font-bold text-center"
                          />
                          <span className="text-[11px] text-[#9CA3AF]">
                            parcelas nos meses seguintes
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-[#064E3B] text-[11px] text-[#34D399] border border-[#34D399]/40 leading-snug">
                          <Layers className="h-3.5 w-3.5 inline mr-1 text-[#34D399]" />
                          Serão geradas <strong>{installmentsCount} parcelas mensais</strong> de R$ {amountStr}. Aparecerá exclusivamente na página mensal.
                        </div>
                        {errors.installments && (
                          <p className="text-[11px] text-[#F87171] font-medium">{errors.installments}</p>
                        )}
                      </div>
                    )}

                    {/* Configuração de Dívida / Custo Fixo */}
                    {recurrenceType === 'fixed' && (
                      <div className="pt-1 space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#9CA3AF]">
                            Duração da repetição fixa:
                          </label>
                          <select
                            value={fixedMonthsCount}
                            onChange={e => setFixedMonthsCount(parseInt(e.target.value, 10) || 12)}
                            className="text-xs px-2 py-1 border border-[#374151] rounded-lg bg-[#1F2937] text-[#F9FAFB] outline-none"
                          >
                            <option value={6}>6 meses</option>
                            <option value={12}>12 meses (1 ano)</option>
                            <option value={24}>24 meses (2 anos)</option>
                            <option value={36}>36 meses (3 anos)</option>
                          </select>
                        </div>
                        <div className="p-2 rounded-lg bg-[#064E3B] text-[11px] text-[#34D399] border border-[#34D399]/40 leading-snug">
                          <Repeat className="h-3.5 w-3.5 inline mr-1 text-[#34D399]" />
                          Será repetido fixamente todos os meses nos próximos <strong>{fixedMonthsCount} meses</strong>. Aparecerá exclusivamente na página mensal.
                        </div>
                      </div>
                    )}

                    {/* Único Mensal */}
                    {recurrenceType === 'single' && (
                      <div className="p-2 rounded-lg bg-[#064E3B] text-[11px] text-[#34D399] border border-[#34D399]/40 leading-snug">
                        🗓️ <strong>Lançamento Único Mensal:</strong> Aparecerá exclusivamente na página mensal deste mês.
                      </div>
                    )}
                  </>
                )}
                {editingTransaction && (
                  <div className="p-2 rounded-lg bg-[#064E3B] text-[11px] text-[#34D399] border border-[#34D399]/40 leading-snug">
                    🗓️ <strong>Lançamento Mensal:</strong> Vinculado à página mensal.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data (somente a data) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              {recurrenceType === 'installment' ? 'Data da 1ª Parcela *' : 'Data *'}
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl border border-[#374151] bg-[#111827] focus-within:border-[#34D399]">
              <Calendar className="h-4 w-4 text-[#9CA3AF] mr-2 shrink-0" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-[#F9FAFB]"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-[#F87171] font-medium">{errors.date}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                Categoria *
              </label>
              {onOpenAddCategory && (
                <button
                  type="button"
                  onClick={() => onOpenAddCategory(type)}
                  className="text-xs text-[#34D399] hover:underline font-medium flex items-center"
                >
                  <Plus className="h-3 w-3 mr-0.5" />
                  Nova Categoria
                </button>
              )}
            </div>
            <div className="flex items-center px-3 py-2 rounded-xl border border-[#374151] bg-[#111827] focus-within:border-[#34D399]">
              <Tag className="h-4 w-4 text-[#9CA3AF] mr-2 shrink-0" />
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-[#F9FAFB]"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#1F2937] text-[#F9FAFB]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-[#F87171] font-medium">{errors.category}</p>
            )}
          </div>

          {/* Observações (Opcional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
              Observações (Opcional)
            </label>
            <div className="flex items-start px-3 py-2 rounded-xl border border-[#374151] bg-[#111827] focus-within:border-[#34D399]">
              <AlignLeft className="h-4 w-4 text-[#9CA3AF] mr-2 mt-0.5 shrink-0" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anotações adicionais, credor, contrato..."
                rows={2}
                className="w-full text-xs outline-none bg-transparent text-[#F9FAFB] placeholder-[#6B7280] resize-none"
              />
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#374151] text-xs font-bold text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-[#111827] shadow-md flex items-center space-x-1.5 transition-all active:scale-[0.98] ${
                isIncome
                  ? 'bg-[#34D399] hover:bg-[#10B981]'
                  : 'bg-[#F87171] hover:bg-[#EF4444]'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Check className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? 'Salvando...'
                  : recurrenceType === 'installment'
                  ? `Gerar ${installmentsCount}x Parcelas`
                  : recurrenceType === 'fixed'
                  ? 'Salvar Fixo Mensal'
                  : 'Salvar Lançamento'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
