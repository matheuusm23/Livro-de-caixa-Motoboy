/**
 * Aplicativo de Controle Financeiro — Livro Caixa
 * Inspirado no layout clássico e robusto do Livro Caixa para Android.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { PeriodFilter, Transaction, Category, Account, UserProfile, TransactionType, PeriodScope } from './types/finance';
import { StorageService } from './services/storage';
import {
  computeAllAccumulatedBalances,
  computePeriodSummary,
  computeDailyRateBreakdown,
  isMonthlyTransaction,
  isMonthlyAccountTransaction,
  isDailyTransaction,
  isWeeklyTransaction,
  EnrichedTransaction,
} from './utils/calculations';
import { getPeriodRange, navigateNext, navigatePrevious } from './utils/date';

// Componentes
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { BackupBanner } from './components/BackupBanner';
import { PeriodFilterBar } from './components/PeriodFilterBar';
import { DateNavigationBar } from './components/DateNavigationBar';
import { TransactionList } from './components/TransactionList';
import { ActionButtons } from './components/ActionButtons';
import { FinancialSummary } from './components/FinancialSummary';
import { TransactionModal } from './components/TransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { SearchFilterModal } from './components/SearchFilterModal';
import { DashboardView } from './components/DashboardView';
import { CategoriesModal } from './components/CategoriesModal';
import { WorkScheduleView } from './components/WorkScheduleView';
import { BackupModal } from './components/BackupModal';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Dados persistidos
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.loadCategories());
  const [accounts, setAccounts] = useState<Account[]>(() => StorageService.loadAccounts());
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.loadProfile());
  const [offDays, setOffDays] = useState<string[]>(() => StorageService.loadOffDays());

  // Estado de navegação e filtros
  const [currentView, setCurrentView] = useState<string>('livro'); // 'livro', 'dashboard', 'receitas', 'despesas', 'categorias', 'contas', 'escala'
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('monthly');
  // Data âncora: 10 de outubro de 2026 (data de referência)
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date(2026, 9, 10, 12, 0, 0));

  // Modais e gavetas
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultValues, setModalDefaultValues] = useState<{
    date?: string;
    amountInCents?: number;
    description?: string;
    periodScope?: PeriodScope;
  } | undefined>(undefined);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<EnrichedTransaction | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast temporário de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Recarregar dados após restauração de backup
  const handleDataReloaded = () => {
    setTransactions(StorageService.loadTransactions());
    setCategories(StorageService.loadCategories());
    setAccounts(StorageService.loadAccounts());
    setProfile(StorageService.loadProfile());
    setOffDays(StorageService.loadOffDays());
  };

  // Alternar dia de folga
  const handleToggleOffDay = (dateStr: string) => {
    const exists = offDays.includes(dateStr);
    const updated = exists ? offDays.filter(d => d !== dateStr) : [...offDays, dateStr];
    setOffDays(updated);
    StorageService.saveOffDays(updated);
  };

  // Definir múltiplas folgas
  const handleSetMultipleOffDays = (dates: string[]) => {
    setOffDays(dates);
    StorageService.saveOffDays(dates);
  };

  // Limites do período atual
  const { startDateStr, endDateStr, label: dateLabel } = useMemo(() => {
    return getPeriodRange(periodFilter, anchorDate);
  }, [periodFilter, anchorDate]);

  // Cálculo da Diária com recálculo inteligente automático
  const dailyRateBreakdown = useMemo(() => {
    return computeDailyRateBreakdown(
      transactions,
      offDays,
      anchorDate.getFullYear(),
      anchorDate.getMonth()
    );
  }, [anchorDate, transactions, offDays]);

  const dailyRateInCents = dailyRateBreakdown.recalculatedDailyRateInCents;

  // Todas as transações enriquecidas com o saldo acumulado histórico
  const allEnrichedTransactions = useMemo(() => {
    return computeAllAccumulatedBalances(transactions);
  }, [transactions]);

  // Transações exibidas na tela principal filtradas pelo período e pelo escopo
  // Regra:
  // "Tudo que for incluído na despesa ou na receita se for parcelado fixo ou único deverá aparecer somente na página mensal.
  // Tudo que for incluído no diariamente eu no semanal não deve aparecer no mensal."
  const periodTransactions = useMemo(() => {
    return allEnrichedTransactions.filter(tx => {
      if (currentView === 'receitas' && tx.type !== 'income') return false;
      if (currentView === 'despesas' && tx.type !== 'expense') return false;

      if (periodFilter === 'monthly') {
        // Apenas o que for mensal (parcelado, fixo ou único) aparece na página mensal
        if (!isMonthlyTransaction(tx)) return false;
        return tx.date >= startDateStr && tx.date <= endDateStr;
      }

      if (periodFilter === 'daily') {
        // Apenas o que foi incluído no diariamente para este dia
        if (!isDailyTransaction(tx)) return false;
        return tx.date === startDateStr;
      }

      if (periodFilter === 'weekly') {
        // Apenas o que foi incluído no semanal para esta semana
        if (!isWeeklyTransaction(tx)) return false;
        return tx.date >= startDateStr && tx.date <= endDateStr;
      }

      return true;
    });
  }, [allEnrichedTransactions, startDateStr, endDateStr, periodFilter, currentView]);

  // Resumo financeiro do período (respeitando o filtro de escopo do período)
  // Regra de negócio:
  // "O valor que foi incluído de receitas na lista diariamente deverá calcular também na conta da página mensalmente.
  // Pois tudo que o usuário inclui de receita será para sua dívida"
  const summary = useMemo(() => {
    let relevantTransactions = transactions;
    if (periodFilter === 'monthly') {
      relevantTransactions = transactions.filter(isMonthlyAccountTransaction);
    } else if (periodFilter === 'daily') {
      relevantTransactions = transactions.filter(isDailyTransaction);
    } else if (periodFilter === 'weekly') {
      relevantTransactions = transactions.filter(isWeeklyTransaction);
    }
    return computePeriodSummary(relevantTransactions, startDateStr, endDateStr);
  }, [transactions, startDateStr, endDateStr, periodFilter]);

  // Estatísticas de receitas diárias que foram incluídas e calculadas no mês corrente para amortizar dívidas
  const dailyIncomeInMonthStats = useMemo(() => {
    if (periodFilter !== 'monthly') {
      return { totalCents: 0, count: 0 };
    }
    const dailyIncomes = transactions.filter(
      t => t.type === 'income' && t.periodScope === 'daily' && t.date >= startDateStr && t.date <= endDateStr
    );
    const totalCents = dailyIncomes.reduce((acc, t) => acc + t.amountInCents, 0);
    return { totalCents, count: dailyIncomes.length };
  }, [transactions, periodFilter, startDateStr, endDateStr]);

  // Saldo geral total acumulado
  const totalBalanceInCents = useMemo(() => {
    if (allEnrichedTransactions.length === 0) return 0;
    return allEnrichedTransactions[allEnrichedTransactions.length - 1].accumulatedBalanceInCents;
  }, [allEnrichedTransactions]);

  // Navegação de datas
  const handlePrevDate = () => {
    setAnchorDate(prev => navigatePrevious(periodFilter, prev));
  };

  const handleNextDate = () => {
    setAnchorDate(prev => navigateNext(periodFilter, prev));
  };

  const handleGoToToday = () => {
    setAnchorDate(new Date(2026, 9, 10, 12, 0, 0));
  };

  // Abrir modal de criação
  const handleOpenNewTransaction = (
    type: TransactionType = 'income',
    defaultValues?: {
      date?: string;
      amountInCents?: number;
      description?: string;
      periodScope?: PeriodScope;
    }
  ) => {
    setEditingTransaction(null);
    setTransactionModalType(type);

    const determinedScope: PeriodScope =
      defaultValues?.periodScope ||
      (periodFilter === 'daily'
        ? 'daily'
        : periodFilter === 'weekly'
        ? 'weekly'
        : 'monthly');

    setModalDefaultValues({
      ...defaultValues,
      periodScope: determinedScope,
    });
    setIsTransactionModalOpen(true);
  };

  // Salvar / Editar Lançamento (suporta unitário ou lote de parcelas)
  const handleSaveTransaction = (
    txData:
      | Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
      | Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[],
    editId?: string
  ) => {
    let updated: Transaction[];

    if (Array.isArray(txData)) {
      // Criação em lote (parcelamento ou lançamentos fixos)
      const now = new Date().toISOString();
      const newItems: Transaction[] = txData.map((item, idx) => ({
        ...item,
        id: `tx_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      }));
      updated = [...transactions, ...newItems];
      showToast(`${newItems.length} lançamentos gerados para os próximos meses!`);
    } else if (editId) {
      updated = transactions.map(t =>
        t.id === editId
          ? {
              ...t,
              ...txData,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      showToast('Lançamento atualizado com sucesso!');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [...transactions, newTx];
      showToast('Lançamento registrado com sucesso!');
    }

    setTransactions(updated);
    StorageService.saveTransactions(updated);
  };

  // Excluir Lançamento
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    showToast('Lançamento excluído com sucesso.');
  };

  // Salvar Categorias
  const handleSaveCategory = (category: Category) => {
    const exists = categories.some(c => c.id === category.id);
    let updated: Category[];
    if (exists) {
      updated = categories.map(c => (c.id === category.id ? category : c));
    } else {
      updated = [...categories, category];
    }
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('Categoria salva com sucesso!');
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    StorageService.saveCategories(updated);
    showToast('Categoria removida.');
  };

  // Salvar Contas
  const handleSaveAccount = (account: Account) => {
    const exists = accounts.some(a => a.id === account.id);
    let updated: Account[];
    if (exists) {
      updated = accounts.map(a => (a.id === account.id ? account : a));
    } else {
      updated = [...accounts, account];
    }
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    showToast('Conta salva com sucesso!');
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    StorageService.saveAccounts(updated);
    showToast('Conta removida.');
  };

  // Dispensar aviso de backup
  const handleDismissBackupBanner = () => {
    const updated = { ...profile, backupNoticeDismissed: true };
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  // Salvar perfil
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    showToast('Perfil atualizado!');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#111827] text-[#F9FAFB] font-['Roboto',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1F2937] border border-[#374151] text-[#F9FAFB] text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Menu Lateral (Drawer) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentView={currentView}
        onSelectView={view => {
          if (view === 'categorias') {
            setIsCategoriesModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        profile={profile}
        totalBalanceInCents={totalBalanceInCents}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogoutOrReset={() => setIsBackupModalOpen(true)}
      />

      {/* Janela Principal da Aplicação */}
      <div className="flex flex-col flex-1 h-full max-w-2xl mx-auto w-full bg-[#1F2937] sm:shadow-2xl sm:border-x sm:border-[#374151] overflow-hidden">
        {/* Barra Superior Azul Tradicional */}
        <Header
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenNewTransaction={() => handleOpenNewTransaction('income')}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          currentView={currentView}
          onChangeView={view => {
            if (view === 'categorias') setIsCategoriesModalOpen(true);
            else setCurrentView(view);
          }}
        />

        {/* Módulos Específicos: Dashboard ou Escala de Folgas */}
        {currentView === 'dashboard' ? (
          <DashboardView
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            currentDate={anchorDate}
            onBackToLivro={() => setCurrentView('livro')}
            onNewTransaction={handleOpenNewTransaction}
          />
        ) : currentView === 'escala' ? (
          <WorkScheduleView
            currentDate={anchorDate}
            onChangeDate={setAnchorDate}
            offDays={offDays}
            onToggleOffDay={handleToggleOffDay}
            onSetMultipleOffDays={handleSetMultipleOffDays}
            transactions={transactions}
            onBackToLivro={() => setCurrentView('livro')}
            onLaunchDailyRate={(dateStr, suggestedAmountInCents) => {
              handleOpenNewTransaction('income', {
                date: dateStr,
                amountInCents: suggestedAmountInCents,
                description: 'Diária - Trabalho',
                periodScope: 'daily',
              });
            }}
          />
        ) : (
          /* Módulo Principal: Livro Caixa */
          <div className="flex-1 flex flex-col min-h-0 bg-[#111827] overflow-hidden">
            {/* Aviso de Backup (se não dispensado) */}
            {!profile.backupNoticeDismissed && (
              <BackupBanner
                onConfigureBackup={() => setIsBackupModalOpen(true)}
                onDismiss={handleDismissBackupBanner}
              />
            )}

            {/* Faixa de Filtros em Cápsula (Todos, Diariamente, Semanal, Mensalmente) */}
            <PeriodFilterBar
              currentFilter={periodFilter}
              onSelectFilter={filter => setPeriodFilter(filter)}
            />

            {/* Faixa Azul de Navegação de Datas */}
            <DateNavigationBar
              dateLabel={dateLabel}
              onPrev={handlePrevDate}
              onNext={handleNextDate}
              onToday={handleGoToToday}
              periodFilter={periodFilter}
            />

            {/* Lista de Movimentações */}
            <TransactionList
              transactions={periodTransactions}
              previousBalanceInCents={summary.previousBalanceInCents}
              categories={categories}
              accounts={accounts}
              periodFilter={periodFilter}
              dailyIncomeInMonthCents={dailyIncomeInMonthStats.totalCents}
              dailyIncomeCountInMonth={dailyIncomeInMonthStats.count}
              onNavigateToDaily={() => setPeriodFilter('daily')}
              onSelectTransaction={tx => setSelectedTxForDetail(tx)}
              onNewTransaction={handleOpenNewTransaction}
            />

            {/* Botões Principais: RECEITA (Verde) e DESPESA (Vermelho) lado a lado (~72px) */}
            <ActionButtons
              onAddIncome={() => handleOpenNewTransaction('income')}
              onAddExpense={() => handleOpenNewTransaction('expense')}
            />

            {/* Resumo Financeiro em 4 Colunas: Receita | Despesa | Resultado | Diária */}
            <FinancialSummary
              summary={summary}
              dailyRateInCents={dailyRateInCents}
              dailyRateBreakdown={dailyRateBreakdown}
            />
          </div>
        )}
      </div>

      {/* Modais da Aplicação */}
      {/* 1. Modal de Cadastro/Edição de Lançamento */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
          setModalDefaultValues(undefined);
        }}
        onSave={handleSaveTransaction}
        initialType={transactionModalType}
        initialPeriodScope={
          modalDefaultValues?.periodScope ||
          (periodFilter === 'daily' ? 'daily' : periodFilter === 'weekly' ? 'weekly' : 'monthly')
        }
        editingTransaction={editingTransaction}
        categories={categories}
        accounts={accounts}
        onOpenAddCategory={() => setIsCategoriesModalOpen(true)}
        defaultValues={modalDefaultValues}
      />

      {/* 2. Modal de Detalhes do Lançamento */}
      <TransactionDetailModal
        transaction={selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
        onEdit={tx => {
          setEditingTransaction(tx);
          setTransactionModalType(tx.type);
          setIsTransactionModalOpen(true);
        }}
        onDelete={handleDeleteTransaction}
        categories={categories}
        accounts={accounts}
      />

      {/* 3. Modal de Pesquisa e Filtros */}
      <SearchFilterModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        allTransactions={allEnrichedTransactions}
        categories={categories}
        accounts={accounts}
        onSelectTransaction={tx => setSelectedTxForDetail(tx)}
      />

      {/* 4. Modal de Categorias */}
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 5. Modal de Backup e Restauração */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReloaded={handleDataReloaded}
      />

      {/* 7. Modal de Configurações */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
