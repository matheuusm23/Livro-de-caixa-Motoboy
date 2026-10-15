import { Account, Category, Transaction, UserProfile } from '../types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'livrocaixa_transactions_v2',
  CATEGORIES: 'livrocaixa_categories_v1',
  ACCOUNTS: 'livrocaixa_accounts_v1',
  PROFILE: 'livrocaixa_profile_v1',
  OFF_DAYS: 'livrocaixa_off_days_v1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Receitas
  { id: 'cat_rec_1', name: 'Salário & Remuneração', type: 'income', icon: 'Banknote', color: '#4CAF50', isDefault: true },
  { id: 'cat_rec_2', name: 'Serviços & Freelance', type: 'income', icon: 'Briefcase', color: '#00897B', isDefault: true },
  { id: 'cat_rec_3', name: 'Vendas & Comércio', type: 'income', icon: 'ShoppingBag', color: '#2E7D32', isDefault: true },
  { id: 'cat_rec_4', name: 'Rendimentos & Investimentos', type: 'income', icon: 'TrendingUp', color: '#1976D2', isDefault: true },
  { id: 'cat_rec_5', name: 'Reembolso & Devolução', type: 'income', icon: 'RotateCcw', color: '#00ACC1', isDefault: true },
  { id: 'cat_rec_6', name: 'Outras Receitas', type: 'income', icon: 'PlusCircle', color: '#43A047', isDefault: true },

  // Despesas
  { id: 'cat_desp_1', name: 'Alimentação & Mercado', type: 'expense', icon: 'Utensils', color: '#E53935', isDefault: true },
  { id: 'cat_desp_2', name: 'Transporte & Combustível', type: 'expense', icon: 'Car', color: '#FB8C00', isDefault: true },
  { id: 'cat_desp_3', name: 'Moradia & Contas de Casa', type: 'expense', icon: 'Home', color: '#8E24AA', isDefault: true },
  { id: 'cat_desp_4', name: 'Saúde & Medicamentos', type: 'expense', icon: 'HeartPulse', color: '#D81B60', isDefault: true },
  { id: 'cat_desp_5', name: 'Educação & Cursos', type: 'expense', icon: 'GraduationCap', color: '#3949AB', isDefault: true },
  { id: 'cat_desp_6', name: 'Lazer & Restaurantes', type: 'expense', icon: 'Palmtree', color: '#F4511E', isDefault: true },
  { id: 'cat_desp_7', name: 'Compras Pessoais', type: 'expense', icon: 'ShoppingCart', color: '#5E35B1', isDefault: true },
  { id: 'cat_desp_8', name: 'Outras Despesas', type: 'expense', icon: 'HelpCircle', color: '#757575', isDefault: true },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Carteira Dinheiro', type: 'cash', initialBalanceInCents: 15000, color: '#4CAF50', icon: 'Wallet' },
  { id: 'acc_2', name: 'Conta Nubank', type: 'checking', initialBalanceInCents: 120000, color: '#8A05BE', icon: 'CreditCard' },
  { id: 'acc_3', name: 'Banco Inter', type: 'checking', initialBalanceInCents: 85000, color: '#FF7A00', icon: 'Building' },
  { id: 'acc_4', name: 'Reserva de Emergência', type: 'savings', initialBalanceInCents: 350000, color: '#1976D2', icon: 'PiggyBank' },
];

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default',
  name: 'Usuário',
  email: 'usuario@email.com',
  backupNoticeDismissed: false,
  currency: 'BRL',
};

export const StorageService = {
  loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        this.saveTransactions([]);
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Falha ao salvar transações no localStorage', e);
    }
  },

  loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Falha ao salvar categorias no localStorage', e);
    }
  },

  loadAccounts(): Account[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        this.saveAccounts(DEFAULT_ACCOUNTS);
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: Account[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Falha ao salvar contas no localStorage', e);
    }
  },

  loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        this.saveProfile(DEFAULT_USER_PROFILE);
        return DEFAULT_USER_PROFILE;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Falha ao salvar perfil', e);
    }
  },

  loadOffDays(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFF_DAYS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveOffDays(offDays: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFF_DAYS, JSON.stringify(offDays));
    } catch (e) {
      console.error('Falha ao salvar dias de folga', e);
    }
  },

  /**
   * Exporta os dados completos para backup em formato JSON
   */
  exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Livro Caixa - Controle Financeiro',
      profile: this.loadProfile(),
      categories: this.loadCategories(),
      accounts: this.loadAccounts(),
      transactions: this.loadTransactions(),
    };
    return JSON.stringify(backup, null, 2);
  },

  /**
   * Importa e restaura os dados completos a partir de arquivo JSON
   */
  importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
        throw new Error('Arquivo de backup inválido: dados de lançamentos não encontrados');
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
      if (parsed.accounts && Array.isArray(parsed.accounts)) {
        this.saveAccounts(parsed.accounts);
      }
      if (parsed.profile) {
        this.saveProfile({ ...parsed.profile, lastBackupDate: new Date().toISOString() });
      }
      this.saveTransactions(parsed.transactions);
      return true;
    } catch (e) {
      console.error('Erro ao importar backup:', e);
      return false;
    }
  },

  /**
   * Restaura para os dados demonstrativos de fábrica
   */
  resetToDemo(): void {
    this.saveTransactions(INITIAL_DEMO_TRANSACTIONS);
    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveAccounts(DEFAULT_ACCOUNTS);
    this.saveProfile(DEFAULT_USER_PROFILE);
  },

  /**
   * Gera e dispara download de arquivo CSV de movimentações
   */
  downloadCSV(transactions: Transaction[], categories: Category[], accounts: Account[]): void {
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const accMap = new Map(accounts.map(a => [a.id, a.name]));

    const header = ['ID', 'Data', 'Horário', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor (R$)', 'Observações'];
    const rows = transactions.map(t => {
      const tipo = t.type === 'income' ? 'Receita' : 'Despesa';
      const valor = (t.amountInCents / 100).toFixed(2).replace('.', ',');
      const cat = catMap.get(t.categoryId) || 'Sem Categoria';
      const acc = (t.accountId ? accMap.get(t.accountId) : undefined) || 'Geral';
      const obs = (t.notes || '').replace(/"/g, '""');
      const desc = (t.description || '').replace(/"/g, '""');

      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${t.time}"`,
        `"${tipo}"`,
        `"${desc}"`,
        `"${cat}"`,
        `"${acc}"`,
        `"${valor}"`,
        `"${obs}"`,
      ].join(';');
    });

    // UTF-8 BOM (\uFEFF) para abrir corretamente no Excel em português com acentos
    const csvContent = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `livro_caixa_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
