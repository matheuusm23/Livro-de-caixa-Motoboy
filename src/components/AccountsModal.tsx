import React, { useState } from 'react';
import { X, Plus, Wallet, Edit2, Trash2, Check } from 'lucide-react';
import { Account, AccountType, Transaction } from '../types/finance';
import { formatBRL, maskCurrencyInput, parseBRLToCents } from '../utils/currency';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balanceStr, setBalanceStr] = useState('0,00');

  if (!isOpen) return null;

  // Calcula o saldo atual de cada conta
  const accountsWithCurrentBalance = accounts.map(acc => {
    let current = acc.initialBalanceInCents;
    for (const t of transactions) {
      if (t.accountId === acc.id) {
        if (t.type === 'income') current += t.amountInCents;
        else current -= t.amountInCents;
      }
    }
    return {
      ...acc,
      currentBalanceInCents: current,
    };
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setType('checking');
    setBalanceStr('0,00');
    setIsAddingNew(true);
  };

  const handleStartEdit = (acc: Account) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    const reais = (acc.initialBalanceInCents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setBalanceStr(reais);
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialCents = parseBRLToCents(balanceStr);

    const newAcc: Account = {
      id: editingId || `acc_${Date.now()}`,
      name: name.trim(),
      type,
      initialBalanceInCents: initialCents,
      color: '#1976D2',
    };

    onSaveAccount(newAcc);
    setIsAddingNew(false);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#1F2937] text-[#F9FAFB] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#111827] p-4 text-[#F9FAFB] border-b border-[#374151] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-[#34D399]" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Contas e Carteiras</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário Add/Edit inline */}
        {isAddingNew && (
          <form onSubmit={handleSave} className="p-4 bg-[#111827] border-b border-[#374151] space-y-3">
            <h4 className="text-xs font-bold text-[#34D399] uppercase">
              {editingId ? 'Editar Conta' : 'Nova Conta ou Carteira'}
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">Nome da Conta</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Banco Itaú, Carteira Dinheiro, Nubank..."
                className="w-full text-xs p-2 rounded-xl border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#34D399] placeholder-[#6B7280]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">Tipo</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
                >
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança / Reserva</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">Saldo Inicial</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={balanceStr}
                  onChange={e => setBalanceStr(maskCurrencyInput(e.target.value))}
                  placeholder="0,00"
                  className="w-full text-xs p-2 rounded-xl border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#374151] bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs rounded-lg bg-[#34D399] text-[#111827] font-bold flex items-center space-x-1 hover:bg-[#10B981]"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Salvar</span>
              </button>
            </div>
          </form>
        )}

        {/* Lista de Contas */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#374151] p-2">
          {accountsWithCurrentBalance.map(acc => (
            <div key={acc.id} className="p-3 flex items-center justify-between hover:bg-[#374151]/40 rounded-lg transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#F9FAFB]">{acc.name}</span>
                  <span className="text-[10px] text-[#9CA3AF] bg-[#111827] border border-[#374151] px-1.5 py-0.5 rounded capitalize">
                    {acc.type}
                  </span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                  Saldo Inicial: {formatBRL(acc.initialBalanceInCents)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-[#9CA3AF] block">Saldo Atual</span>
                  <span
                    className={`text-xs font-extrabold ${
                      acc.currentBalanceInCents >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                    }`}
                  >
                    {formatBRL(acc.currentBalanceInCents)}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStartEdit(acc)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#34D399] rounded-md hover:bg-[#374151]"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => onDeleteAccount(acc.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#F87171] rounded-md hover:bg-[#374151]"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        {!isAddingNew && (
          <div className="p-3 bg-[#111827] border-t border-[#374151]">
            <button
              onClick={handleStartAdd}
              className="w-full py-2.5 rounded-xl bg-[#34D399] hover:bg-[#10B981] text-[#111827] text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Nova Conta</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
