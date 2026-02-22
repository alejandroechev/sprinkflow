import { describe, it, expect } from "vitest";
import {
  sprinklerFlow,
  requiredPressure,
  flowFromDensity,
  STANDARD_K_FACTORS,
} from "../src/sprinkler-head";

describe("Sprinkler Head", () => {
  it("calculates flow for K=5.6, P=7 psi", () => {
    const q = sprinklerFlow(5.6, 7);
    // Q = 5.6 × √7 = 5.6 × 2.6458 ≈ 14.82
    expect(q).toBeCloseTo(14.82, 1);
  });

  it("calculates flow for K=8.0, P=10 psi", () => {
    const q = sprinklerFlow(8.0, 10);
    expect(q).toBeCloseTo(25.3, 1);
  });

  it("returns 0 for zero pressure", () => {
    expect(sprinklerFlow(5.6, 0)).toBe(0);
  });

  it("returns 0 for negative inputs", () => {
    expect(sprinklerFlow(-5.6, 10)).toBe(0);
    expect(sprinklerFlow(5.6, -10)).toBe(0);
  });

  it("calculates required pressure for K=5.6, Q=15 GPM", () => {
    const p = requiredPressure(5.6, 15);
    // P = (15/5.6)² = (2.679)² ≈ 7.17
    expect(p).toBeCloseTo(7.17, 1);
  });

  it("flow and pressure are inverses", () => {
    const k = 5.6;
    const p = 10;
    const q = sprinklerFlow(k, p);
    const pCalc = requiredPressure(k, q);
    expect(pCalc).toBeCloseTo(p, 5);
  });

  it("calculates flow from density", () => {
    // 0.15 GPM/ft² × 130 ft² = 19.5 GPM
    expect(flowFromDensity(0.15, 130)).toBeCloseTo(19.5, 1);
  });

  it("has standard K-factors", () => {
    expect(STANDARD_K_FACTORS).toContain(5.6);
    expect(STANDARD_K_FACTORS).toContain(8.0);
    expect(STANDARD_K_FACTORS.length).toBeGreaterThanOrEqual(8);
  });

  it("higher K-factor = more flow at same pressure", () => {
    const q1 = sprinklerFlow(5.6, 10);
    const q2 = sprinklerFlow(8.0, 10);
    expect(q2).toBeGreaterThan(q1);
  });
});
