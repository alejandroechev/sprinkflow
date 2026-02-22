import { describe, it, expect } from "vitest";
import {
  SCHEDULE_40_PIPES,
  C_FACTORS,
  FITTING_EQUIVALENT_LENGTHS,
  totalEquivalentLength,
  getPipeDiameter,
  adjustEquivalentLength,
} from "../src/pipe-data";

describe("Pipe Reference Data", () => {
  it("has correct 2\" Schedule 40 ID", () => {
    const pipe = SCHEDULE_40_PIPES.find((p) => p.nominal === '2"');
    expect(pipe?.internalDiameter).toBe(2.067);
  });

  it("has correct 1-1/4\" Schedule 40 ID", () => {
    const pipe = SCHEDULE_40_PIPES.find((p) => p.nominal === '1-1/4"');
    expect(pipe?.internalDiameter).toBe(1.38);
  });

  it("has all standard sizes from 3/4\" to 8\"", () => {
    expect(SCHEDULE_40_PIPES.length).toBeGreaterThanOrEqual(12);
    expect(SCHEDULE_40_PIPES[0].nominal).toBe('3/4"');
    expect(SCHEDULE_40_PIPES[SCHEDULE_40_PIPES.length - 1].nominal).toBe('8"');
  });

  it("has C-factor 120 for black steel", () => {
    expect(C_FACTORS.black_steel).toBe(120);
  });

  it("has C-factor 150 for copper", () => {
    expect(C_FACTORS.copper).toBe(150);
  });

  it("has fitting equivalent lengths for 2\" pipe", () => {
    const table = FITTING_EQUIVALENT_LENGTHS['2"'];
    expect(table).toBeDefined();
    expect(table.elbow_90).toBe(5);
    expect(table.tee_branch).toBe(10);
  });

  it("calculates total equivalent length for fittings", () => {
    const total = totalEquivalentLength('2"', ["elbow_90", "elbow_90", "tee_branch"]);
    // 5 + 5 + 10 = 20
    expect(total).toBe(20);
  });

  it("returns 0 for unknown pipe size", () => {
    expect(totalEquivalentLength("99\"", ["elbow_90"])).toBe(0);
  });

  it("looks up pipe diameter", () => {
    expect(getPipeDiameter('2"')).toBe(2.067);
    expect(getPipeDiameter('99"')).toBeUndefined();
  });

  it("adjusts equivalent length for different C-factor", () => {
    // For C=150: adjusted = original × (120/150) = original × 0.8
    const adjusted = adjustEquivalentLength(10, 150);
    expect(adjusted).toBe(8);
  });

  it("no adjustment needed for C=120", () => {
    expect(adjustEquivalentLength(10, 120)).toBe(10);
  });
});
