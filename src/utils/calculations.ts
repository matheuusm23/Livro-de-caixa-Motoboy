import { FinancialSummaryData, PeriodScope, Transaction } from '../types/finance';

export interface EnrichedTransaction extends Transaction {
  accumulatedBalanceInCents: number;
}

/**
 * Verifica se a transação pertence ao escopo mensal (parcelado, fixo ou único).
 * Conforme a regra de negócio:
 * "Tudo que for incluído na despesa ou na receita se for parcelado fixo ou único deverá aparecer somente na página mensal.
 * Tudo que for incluído no diariamente e no semanal não deve aparecer no mensal."
 */
export function isMonthlyTransaction(tx: Transaction): boolean {
  if (tx.periodScope === 'daily' || tx.periodScope === 'weekly') {
    return false;
  }
  return true;
}

export function isDailyTransaction(tx: Transaction): boolean {
  return tx.periodScope === 'daily';
}

export function isWeeklyTransaction(tx: Transaction): boolean {
  return tx.periodScope === 'weekly';
}

/**
 * Verifica se a transação deve ser calculada na conta da página mensalmente.
 * Conforme a regra de negócio:
 * "O valor que foi incluído de receitas na lista diariamente deverá calcular também na conta da página mensalmente.
 * Pois tudo que o usuário inclui de receita será para sua dívida"
 *
 * - Despesas: apenas despesas com escopo mensal (parcelado, fixo ou único).
 * - Receitas: todas as receitas do mês (mensais, diárias e semanais) são calculadas na conta mensal para abater a dívida.
 */
export function isMonthlyAccountTransaction(tx: Transaction): boolean {
  if (tx.type === 'expense') {
    return isMonthlyTransaction(tx);
  }
  if (tx.type === 'income') {
    return true;
  }
  return false;
}

/**
 * Ordena as transações em ordem cronológica estrita (Data ASC, Horário ASC, CreatedAt ASC)
 */
export function sortTransactionsChronological(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
}

/**
 * Calcula o saldo acumulado de cada transação ao longo do tempo.
 * Retorna uma lista com todas as transações enriquecidas com accumulatedBalanceInCents.
 */
export function computeAllAccumulatedBalances(
  allTransactions: Transaction[],
  initialBaseBalanceInCents = 0
): EnrichedTransaction[] {
  const sorted = sortTransactionsChronological(allTransactions);
  let runningBalance = initialBaseBalanceInCents;

  return sorted.map(tx => {
    if (tx.type === 'income') {
      runningBalance += tx.amountInCents;
    } else {
      runningBalance -= tx.amountInCents;
    }
    return {
      ...tx,
      accumulatedBalanceInCents: runningBalance,
    };
  });
}

/**
 * Calcula o resumo financeiro para um intervalo de datas [startDateStr, endDateStr].
 * Saldo anterior = soma de todas as transações com date < startDateStr
 * Receita do período = soma de receitas com startDateStr <= date <= endDateStr
 * Despesa do período = soma de despesas com startDateStr <= date <= endDateStr
 * Resultado do período = Receita do período - Despesa do período
 * Saldo final = Saldo anterior + Resultado do período
 */
export function computePeriodSummary(
  allTransactions: Transaction[],
  startDateStr: string,
  endDateStr: string,
  initialBaseBalanceInCents = 0
): FinancialSummaryData {
  let previousBalance = initialBaseBalanceInCents;
  let periodIncome = 0;
  let periodExpense = 0;

  for (const tx of allTransactions) {
    if (tx.date < startDateStr) {
      if (tx.type === 'income') {
        previousBalance += tx.amountInCents;
      } else {
        previousBalance -= tx.amountInCents;
      }
    } else if (tx.date <= endDateStr) {
      if (tx.type === 'income') {
        periodIncome += tx.amountInCents;
      } else {
        periodExpense += tx.amountInCents;
      }
    }
  }

  const periodNet = periodIncome - periodExpense;
  const finalBalance = previousBalance + periodNet;

  return {
    previousBalanceInCents: previousBalance,
    periodIncomeInCents: periodIncome,
    periodExpenseInCents: periodExpense,
    periodNetInCents: periodNet,
    finalBalanceInCents: finalBalance,
  };
}

/**
 * Agrupa transações por data no período, preservando a ordem cronológica ou inversa (mais recentes primeiro)
 */
export function groupTransactionsByDate(
  transactions: EnrichedTransaction[],
  descending = true
): { dateStr: string; items: EnrichedTransaction[] }[] {
  const map = new Map<string, EnrichedTransaction[]>();

  for (const tx of transactions) {
    const list = map.get(tx.date) || [];
    list.push(tx);
    map.set(tx.date, list);
  }

  const keys = Array.from(map.keys());
  keys.sort((a, b) => (descending ? b.localeCompare(a) : a.localeCompare(b)));

  return keys.map(dateStr => ({
    dateStr,
    items: map.get(dateStr)!,
  }));
}

export interface DailyRateBreakdown {
  monthPrefix: string;
  totalDaysInMonth: number;
  offDaysCount: number;
  totalWorkDays: number;
  monthlyExpensesInCents: number;
  monthlyIncomeInCents: number;
  baseDailyRateInCents: number;
  daysWorkedCount: number;
  remainingWorkDays: number;
  remainingExpensesInCents: number;
  recalculatedDailyRateInCents: number;
  differencePerDayInCents: number;
  status: 'normal' | 'compensated' | 'deficit' | 'completed';
}

/**
 * Calcula a diária com recálculo inteligente e dinâmico:
 * Se o usuário registrar receitas no mês (recebimento de diárias):
 * - Se fizer a mais que o previsto, a diária dos próximos dias diminui para refletir a compensação.
 * - Se fizer a menos que o previsto, a diária dos próximos dias aumenta para cobrir a diferença.
 * - Se cobrir todas as despesas do mês, a meta é concluída (R$ 0,00 restantes).
 */
export function computeDailyRateBreakdown(
  transactions: Transaction[],
  offDays: string[],
  year: number,
  month: number
): DailyRateBreakdown {
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const totalDaysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();

  // Despesas totais do mês (apenas as despesas que pertencem à página mensal: parcelado, fixo, único)
  const monthlyExpensesInCents = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix) && isMonthlyTransaction(t))
    .reduce((acc, t) => acc + t.amountInCents, 0);

  // Receitas totais do mês
  const monthlyIncomeTransactions = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(monthPrefix));
  const monthlyIncomeInCents = monthlyIncomeTransactions
    .reduce((acc, t) => acc + t.amountInCents, 0);

  // Contagem de dias de folga no mês
  const currentMonthOffDays = offDays.filter(d => d.startsWith(monthPrefix));
  const offDaysCount = currentMonthOffDays.length;
  const totalWorkDays = Math.max(0, totalDaysInMonth - offDaysCount);

  // Diária base inicial prevista (Despesa total ÷ Dias totais de trabalho)
  const baseDailyRateInCents = totalWorkDays > 0
    ? Math.round(monthlyExpensesInCents / totalWorkDays)
    : 0;

  // Dias em que o usuário lançou receitas (diárias realizadas)
  const incomeDatesInMonth = new Set(monthlyIncomeTransactions.map(t => t.date));
  const daysWorkedCount = Math.min(totalWorkDays, incomeDatesInMonth.size);

  // Dias restantes de trabalho planejados no mês
  const remainingWorkDays = Math.max(0, totalWorkDays - daysWorkedCount);

  // Saldo de despesas restantes a cobrir
  const remainingExpensesInCents = Math.max(0, monthlyExpensesInCents - monthlyIncomeInCents);

  let recalculatedDailyRateInCents = 0;
  let status: 'normal' | 'compensated' | 'deficit' | 'completed' = 'normal';

  if (totalWorkDays === 0) {
    recalculatedDailyRateInCents = 0;
    status = 'normal';
  } else if (monthlyExpensesInCents > 0 && remainingExpensesInCents === 0) {
    // 100% das despesas do mês já foram pagas/cobertas
    recalculatedDailyRateInCents = 0;
    status = 'completed';
  } else if (daysWorkedCount === 0) {
    // Nenhuma diária realizada ainda
    recalculatedDailyRateInCents = baseDailyRateInCents;
    status = 'normal';
  } else if (remainingWorkDays > 0) {
    // Recalcula o valor da diária para os dias restantes
    recalculatedDailyRateInCents = Math.round(remainingExpensesInCents / remainingWorkDays);

    if (recalculatedDailyRateInCents < baseDailyRateInCents) {
      // Fez a mais do que o previsto -> diária dos próximos dias diminuiu!
      status = 'compensated';
    } else if (recalculatedDailyRateInCents > baseDailyRateInCents) {
      // Fez a menos do que o previsto -> diária dos próximos dias aumentou!
      status = 'deficit';
    } else {
      status = 'normal';
    }
  } else {
    // Todos os dias previstos de trabalho já foram realizados
    if (remainingExpensesInCents > 0) {
      recalculatedDailyRateInCents = remainingExpensesInCents;
      status = 'deficit';
    } else {
      recalculatedDailyRateInCents = 0;
      status = 'completed';
    }
  }

  const differencePerDayInCents = recalculatedDailyRateInCents - baseDailyRateInCents;

  return {
    monthPrefix,
    totalDaysInMonth,
    offDaysCount,
    totalWorkDays,
    monthlyExpensesInCents,
    monthlyIncomeInCents,
    baseDailyRateInCents,
    daysWorkedCount,
    remainingWorkDays,
    remainingExpensesInCents,
    recalculatedDailyRateInCents,
    differencePerDayInCents,
    status,
  };
}
