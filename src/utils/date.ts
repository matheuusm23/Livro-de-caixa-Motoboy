import { PeriodFilter } from '../types/finance';

/**
 * Utilitários de data seguros para fuso horário de Brasília (America/Sao_Paulo)
 * Evita bugs clássicos causados por new Date(YYYY-MM-DD) interpretado em UTC.
 */

const MONTH_NAMES_SHORT = [
  'jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
];

const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES_FULL = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

/**
 * Converte string 'YYYY-MM-DD' em objeto Date no horário local
 */
export function parseISODate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 12, 0, 0); // Meio-dia para evitar shifts de DST
}

/**
 * Converte Date para string 'YYYY-MM-DD'
 */
export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata 'YYYY-MM-DD' para 'DD/MM/YYYY'
 */
export function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

/**
 * Formata 'YYYY-MM-DD' para cabeçalho: "Sábado, 10 de outubro de 2026"
 */
export function formatDateWithWeekday(dateStr: string): string {
  const date = parseISODate(dateStr);
  const weekday = WEEKDAY_NAMES_FULL[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthName = MONTH_NAMES_FULL[date.getMonth()].toLowerCase();
  const year = date.getFullYear();
  return `${weekday}, ${day} de ${monthName} de ${year}`;
}

/**
 * Formata uma data para texto resumido estilo Android: "10 out. 2026"
 */
export function formatShortDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Retorna o início e fim da semana (Segunda a Domingo)
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday
  // Ajuste para semana começando na Segunda (1) até Domingo (0/7)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: monday, end: sunday };
}

/**
 * Retorna os limites e o rótulo visual do período selecionado
 */
export function getPeriodRange(filter: PeriodFilter, anchorDate: Date): {
  startDateStr: string;
  endDateStr: string;
  label: string;
} {
  if (filter === 'all') {
    return {
      startDateStr: '1970-01-01',
      endDateStr: '2099-12-31',
      label: 'Todos os Lançamentos',
    };
  }

  if (filter === 'daily') {
    const dateStr = toISODateString(anchorDate);
    return {
      startDateStr: dateStr,
      endDateStr: dateStr,
      label: formatShortDate(anchorDate),
    };
  }

  if (filter === 'weekly') {
    const { start, end } = getWeekRange(anchorDate);
    const startStr = toISODateString(start);
    const endStr = toISODateString(end);
    return {
      startDateStr: startStr,
      endDateStr: endStr,
      label: `${formatShortDate(start)} – ${formatShortDate(end)}`,
    };
  }

  // Monthly
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstDay = new Date(year, month, 1, 12, 0, 0);
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0);

  return {
    startDateStr: toISODateString(firstDay),
    endDateStr: toISODateString(lastDay),
    label: `${MONTH_NAMES_FULL[month]} de ${year}`,
  };
}

/**
 * Adiciona meses a uma data no formato YYYY-MM-DD com ajuste seguro de final de mês
 */
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1; // 0-based
  const d = parseInt(parts[2], 10);

  // Calcula novo ano e mês
  const targetMonthIndex = m + monthsToAdd;
  const targetYear = y + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;

  // Descobre quantos dias tem o mês de destino para evitar overflow (ex: 31 de janeiro -> 28 de fevereiro)
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(d, daysInTargetMonth);

  const mm = String(targetMonth + 1).padStart(2, '0');
  const dd = String(targetDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

/**
 * Navega para o período anterior
 */
export function navigatePrevious(filter: PeriodFilter, anchorDate: Date): Date {
  const next = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), 12, 0, 0);
  if (filter === 'daily') {
    next.setDate(next.getDate() - 1);
  } else if (filter === 'weekly') {
    next.setDate(next.getDate() - 7);
  } else if (filter === 'monthly') {
    next.setMonth(next.getMonth() - 1);
  }
  return next;
}

/**
 * Navega para o próximo período
 */
export function navigateNext(filter: PeriodFilter, anchorDate: Date): Date {
  const next = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), 12, 0, 0);
  if (filter === 'daily') {
    next.setDate(next.getDate() + 1);
  } else if (filter === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (filter === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Retorna a hora atual no formato HH:mm
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
