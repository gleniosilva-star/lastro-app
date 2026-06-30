// Funções puras de cálculo financeiro — testáveis isoladamente (finance.test.ts).

/**
 * Taxa de poupança do período: percentual da renda que sobrou.
 * Fórmula: (receitas - despesas) / receitas * 100.
 * Retorna null quando não há renda no período (indicador indefinido).
 */
export function savingsRate(income: number, expense: number): number | null {
  if (!income || income <= 0) return null;
  return ((income - expense) / income) * 100;
}
