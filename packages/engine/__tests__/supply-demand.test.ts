import { describe, it, expect } from "vitest";
import {
  supplyPressureAtFlow,
  generateSupplyCurve,
  evaluateSupplyDemand,
} from "../src/supply-demand";

describe("Supply vs Demand", () => {
  it("returns static pressure at 0 flow", () => {
    expect(supplyPressureAtFlow(80, 60, 1000, 0)).toBe(80);
  });

  it("returns residual pressure at test flow", () => {
    expect(supplyPressureAtFlow(80, 60, 1000, 1000)).toBe(60);
  });

  it("interpolates linearly between static and residual", () => {
    const p = supplyPressureAtFlow(80, 60, 1000, 500);
    expect(p).toBe(70); // midpoint
  });

  it("extrapolates beyond test flow", () => {
    const p = supplyPressureAtFlow(80, 60, 1000, 1500);
    expect(p).toBe(50);
  });

  it("never goes below 0", () => {
    const p = supplyPressureAtFlow(80, 60, 1000, 5000);
    expect(p).toBe(0);
  });

  it("generates supply curve with correct endpoints", () => {
    const curve = generateSupplyCurve(80, 60, 1000);
    expect(curve.length).toBe(21); // 0 to 20 inclusive
    expect(curve[0].flow).toBe(0);
    expect(curve[0].pressure).toBe(80);
  });

  it("evaluates adequate supply", () => {
    const result = evaluateSupplyDemand(80, 60, 1000, 200, 30, 250);
    // At 450 GPM total, available = 80 - (20/1000)*450 = 80 - 9 = 71 psi
    // Demand = 30 psi → margin = 41 psi
    expect(result.adequate).toBe(true);
    expect(result.marginPsi).toBeGreaterThan(0);
    expect(result.totalDemand.flow).toBe(450);
  });

  it("evaluates inadequate supply", () => {
    // Low supply: 20 psi static, 10 psi at 500 GPM
    const result = evaluateSupplyDemand(20, 10, 500, 400, 50, 250);
    // At 650 GPM, available = 20 - (10/500)*650 = 20 - 13 = 7 psi
    // Demand = 50 psi → margin = -43 psi
    expect(result.adequate).toBe(false);
    expect(result.marginPsi).toBeLessThan(0);
  });

  it("includes supply curve for plotting", () => {
    const result = evaluateSupplyDemand(80, 60, 1000, 200, 30, 250);
    expect(result.supplyCurve.length).toBeGreaterThan(0);
    expect(result.supplyCurve[0].pressure).toBe(80);
  });
});
