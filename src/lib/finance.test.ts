import { describe, it, expect } from "vitest";
import { savingsRate } from "./finance";

describe("savingsRate", () => {
  it("calcula a sobra como % da renda", () => {
    expect(savingsRate(1000, 800)).toBe(20);
  });

  it("é 100% quando não houve despesa", () => {
    expect(savingsRate(1000, 0)).toBe(100);
  });

  it("é negativa quando gastou mais do que ganhou", () => {
    expect(savingsRate(1000, 1200)).toBe(-20);
  });

  it("retorna null quando não há renda no período", () => {
    expect(savingsRate(0, 500)).toBeNull();
    expect(savingsRate(-100, 50)).toBeNull();
  });

  it("lida com valores decimais (BRL)", () => {
    expect(savingsRate(2500, 1875)).toBeCloseTo(25, 5);
  });
});
