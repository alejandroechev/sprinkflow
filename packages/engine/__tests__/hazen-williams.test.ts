import { describe, it, expect } from "vitest";
import {
  frictionLossPerFoot,
  pipeSegmentFrictionLoss,
  elevationPressure,
  pipeVelocity,
} from "../src/hazen-williams";

describe("Hazen-Williams", () => {
  it("calculates friction loss per foot for 1-1/4\" pipe at 40 GPM, C=120", () => {
    // hf = 4.52 × 40^1.85 / (120^1.85 × 1.38^4.87)
    const hf = frictionLossPerFoot(40, 120, 1.38);
    expect(hf).toBeCloseTo(0.123, 2);
  });

  it("calculates friction loss per foot for 2\" pipe at 100 GPM, C=120", () => {
    const hf = frictionLossPerFoot(100, 120, 2.067);
    // Published value ~0.109 psi/ft
    expect(hf).toBeGreaterThan(0.09);
    expect(hf).toBeLessThan(0.15);
  });

  it("returns 0 for zero flow", () => {
    expect(frictionLossPerFoot(0, 120, 2.067)).toBe(0);
  });

  it("returns 0 for invalid inputs", () => {
    expect(frictionLossPerFoot(-10, 120, 2.067)).toBe(0);
    expect(frictionLossPerFoot(10, -120, 2.067)).toBe(0);
    expect(frictionLossPerFoot(10, 120, 0)).toBe(0);
  });

  it("higher C-factor = lower friction loss", () => {
    const steel = frictionLossPerFoot(50, 120, 2.067);
    const copper = frictionLossPerFoot(50, 150, 2.067);
    expect(copper).toBeLessThan(steel);
  });

  it("larger diameter = lower friction loss", () => {
    const small = frictionLossPerFoot(50, 120, 1.38);
    const large = frictionLossPerFoot(50, 120, 2.067);
    expect(large).toBeLessThan(small);
  });

  it("calculates total segment friction loss", () => {
    const perFoot = frictionLossPerFoot(40, 120, 1.38);
    const total = pipeSegmentFrictionLoss(40, 120, 1.38, 30);
    expect(total).toBeCloseTo(perFoot * 30, 5);
  });

  it("calculates elevation pressure", () => {
    expect(elevationPressure(10)).toBeCloseTo(4.33, 1);
    expect(elevationPressure(0)).toBe(0);
    expect(elevationPressure(-5)).toBeCloseTo(-2.165, 1);
  });

  it("calculates pipe velocity", () => {
    // V = Q / (2.448 × d²)
    const v = pipeVelocity(100, 2.067);
    expect(v).toBeCloseTo(100 / (2.448 * 2.067 * 2.067), 2);
  });

  it("velocity increases with flow", () => {
    const v1 = pipeVelocity(50, 2.067);
    const v2 = pipeVelocity(100, 2.067);
    expect(v2).toBeGreaterThan(v1);
  });
});
