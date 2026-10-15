/**
 * Utilitários para formatação e manipulação de valores monetários em Real (BRL)
 * Trabalha sempre com centavos inteiros para máxima precisão matemática.
 */

export function formatBRL(amountInCents: number, includeSign = false): string {
  const isNegative = amountInCents < 0;
  const absAmount = Math.abs(amountInCents);
  const reais = (absAmount / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (includeSign) {
    if (isNegative) return `- R$ ${reais}`;
    if (amountInCents > 0) return `+ R$ ${reais}`;
  }

  return isNegative ? `- R$ ${reais}` : `R$ ${reais}`;
}

export function formatBRLValueOnly(amountInCents: number): string {
  const absAmount = Math.abs(amountInCents);
  return (absAmount / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte uma string formatada (ex: "R$ 150,50" ou "150,50" ou dígitos digitados) para centavos inteiros
 */
export function parseBRLToCents(val: string): number {
  if (!val) return 0;
  // Remove tudo que não for dígito
  const digitsOnly = val.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  const cents = parseInt(digitsOnly, 10);
  return isNaN(cents) ? 0 : cents;
}

/**
 * Formata enquanto o usuário digita no input (máscara de moeda estilo app bancário brasileiro)
 * Exemplo: usuário digita 5 -> R$ 0,05; depois 0 -> R$ 0,50; depois 0 -> R$ 5,00
 */
export function maskCurrencyInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '0,00';
  const cents = parseInt(digits, 10);
  const formatted = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatted;
}
