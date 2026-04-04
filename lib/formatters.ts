/**
 * Formata um valor numérico de forma segura para uma string com um número fixo de casas decimais.
 * Retorna "0.00" (ou com o número de dígitos especificado) se o valor for nulo, indefinido ou não for um número.
 *
 * @param value O valor a ser formatado.
 * @param digits O número de casas decimais. O padrão é 2.
 * @returns A string numérica formatada (ex: "123.45").
 */
export function safeToFixed(value: any, digits: number = 2): string {
  const num = Number(value);
  if (value === null || value === undefined || isNaN(num)) {
    return (0).toFixed(digits);
  }
  return num.toFixed(digits);
}

/**
 * Formata um valor numérico para uma string no formato de moeda BRL (R$).
 * Utiliza a função safeToFixed para garantir que não quebre com valores inválidos.
 *
 * @param value O valor a ser formatado.
 * @returns A string formatada como "R$ XX,XX".
 */
export function formatCurrency(value: any): string {
  const fixedValue = safeToFixed(value, 2);
  
  // Adicionada uma verificação defensiva para garantir que `fixedValue` é uma string.
  // Isso previne o erro "Cannot read properties of null (reading 'replace')".
  if (typeof fixedValue === 'string') {
    return `R$ ${fixedValue.replace('.', ',')}`;
  }

  // Fallback para qualquer caso inesperado onde um não-string seja retornado.
  return 'R$ 0,00';
}