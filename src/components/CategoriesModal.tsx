import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';
import { Category, TransactionType } from '../types/finance';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  defaultType?: TransactionType;
}

const COLOR_PALETTE = [
  '#4CAF50', '#2E7D32', '#00897B', '#1976D2', '#2196F3',
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#FB8C00', '#F4511E', '#757575', '#546E7A', '#00ACC1'
];

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
  defaultType = 'expense',
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>(defaultType);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2196F3');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const filtered = categories.filter(c => c.type === activeTab);

  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setColor(activeTab === 'income' ? '#4CAF50' : '#EF5350');
    setIsAddingNew(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      id: editingId || `cat_${Date.now()}`,
      name: name.trim(),
      type: activeTab,
      icon: 'Tag',
      color: color,
    };

    onSaveCategory(newCategory);
    setIsAddingNew(false);
    setEditingId(null);
    setName('');
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
            <Tag className="h-5 w-5 text-[#34D399]" />
            <h2 className="text-base font-bold text-[#F9FAFB]">Gerenciador de Categorias</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#374151] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Abas Receitas / Despesas */}
        <div className="p-3 bg-[#111827] border-b border-[#374151]">
          <div className="grid grid-cols-2 gap-2 bg-[#1F2937] p-1 rounded-xl border border-[#374151]">
            <button
              onClick={() => { setActiveTab('income'); setIsAddingNew(false); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'income'
                  ? 'bg-[#34D399] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
              }`}
            >
              Categorias de Receita
            </button>
            <button
              onClick={() => { setActiveTab('expense'); setIsAddingNew(false); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'expense'
                  ? 'bg-[#F87171] text-[#111827] shadow-xs'
                  : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#F9FAFB]'
              }`}
            >
              Categorias de Despesa
            </button>
          </div>
        </div>

        {/* Formulário de adicionar/editar inline */}
        {isAddingNew && (
          <form onSubmit={handleSave} className="p-4 bg-[#111827] border-b border-[#374151] space-y-3">
            <h4 className="text-xs font-bold text-[#34D399] uppercase">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h4>
            <div>
              <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">Nome da Categoria</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Assinaturas, Pets, Farmácia..."
                className="w-full text-xs p-2 rounded-xl border border-[#374151] bg-[#1F2937] text-[#F9FAFB] outline-none focus:border-[#34D399] placeholder-[#6B7280]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1">Cor</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-[#34D399] ring-offset-1 ring-offset-[#111827]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
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

        {/* Lista de Categorias */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#374151] p-2">
          {filtered.map(cat => (
            <div key={cat.id} className="p-2.5 flex items-center justify-between hover:bg-[#374151]/40 rounded-lg transition-colors">
              <div className="flex items-center space-x-2.5">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-semibold text-[#F9FAFB]">{cat.name}</span>
                {cat.isDefault && (
                  <span className="text-[10px] text-[#9CA3AF] bg-[#111827] border border-[#374151] px-1.5 py-0.5 rounded">
                    Padrão
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 text-[#9CA3AF] hover:text-[#34D399] rounded-md hover:bg-[#374151]"
                  title="Editar"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#F87171] rounded-md hover:bg-[#374151]"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
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
              <span>Adicionar Nova Categoria</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
