import { describe, it, expect } from "vitest";
import {
  HAZARD_CRITERIA,
  getHazardCriteria,
  minSprinklersInArea,
  totalSystemDemand,
  requiredSupplyVolume,
} from "../src/nfpa13";

describe("NFPA 13 Design Criteria", () => {
  it("Light Hazard has density 0.10 GPM/ft²", () => {
    const c = getHazardCriteria("light");
    expect(c.density).toBe(0.10);
    expect(c.area).toBe(1500);
    expect(c.hoseStreamGPM).toBe(100);
  });

  it("OH-1 has density 0.15 GPM/ft²", () => {
    const c = getHazardCriteria("ordinary_1");
    expect(c.density).toBe(0.15);
    expect(c.area).toBe(1500);
    expect(c.maxCoveragePerHead).toBe(130);
  });

  it("OH-2 has density 0.20 GPM/ft²", () => {
    expect(getHazardCriteria("ordinary_2").density).toBe(0.20);
  });

  it("EH-1 has density 0.30 and area 2500 ft²", () => {
    const c = getHazardCriteria("extra_1");
    expect(c.density).toBe(0.30);
    expect(c.area).toBe(2500);
    expect(c.hoseStreamGPM).toBe(500);
  });

  it("EH-2 has density 0.40", () => {
    expect(getHazardCriteria("extra_2").density).toBe(0.40);
  });

  it("has all 5 hazard classes", () => {
    expect(Object.keys(HAZARD_CRITERIA)).toHaveLength(5);
  });

  it("calculates min sprinklers in area", () => {
    // 1500 ft² / 130 ft²/head = 11.54 → 12
    expect(minSprinklersInArea(1500, 130)).toBe(12);
    // 1500 / 225 = 6.67 → 7
    expect(minSprinklersInArea(1500, 225)).toBe(7);
  });

  it("calculates total system demand", () => {
    // Sprinkler: 225 GPM + Hose: 250 GPM = 475 GPM
    expect(totalSystemDemand(225, 250)).toBe(475);
  });

  it("calculates required supply volume", () => {
    // 475 GPM × 60 min = 28,500 gallons
    expect(requiredSupplyVolume(475, 60)).toBe(28500);
  });

  it("duration increases with hazard severity", () => {
    const light = getHazardCriteria("light").durationMinutes;
    const oh1 = getHazardCriteria("ordinary_1").durationMinutes;
    const eh2 = getHazardCriteria("extra_2").durationMinutes;
    expect(oh1).toBeGreaterThan(light);
    expect(eh2).toBeGreaterThan(oh1);
  });
});
