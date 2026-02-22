/**
 * NFPA 13 design criteria — hazard classifications, density/area curves,
 * coverage limits, and hose stream allowances.
 * Values widely published in fire protection engineering textbooks.
 */

export type HazardClass =
  | "light"
  | "ordinary_1"
  | "ordinary_2"
  | "extra_1"
  | "extra_2";

export interface HazardCriteria {
  label: string;
  /** Design density in GPM/ft² */
  density: number;
  /** Design area of operation in ft² */
  area: number;
  /** Maximum coverage area per sprinkler in ft² */
  maxCoveragePerHead: number;
  /** Maximum spacing between sprinklers in ft */
  maxSpacing: number;
  /** Hose stream allowance in GPM */
  hoseStreamGPM: number;
  /** Duration of water supply in minutes */
  durationMinutes: number;
}

/**
 * NFPA 13 design criteria by hazard classification.
 * These represent the most common density/area points from the
 * density/area curves (Figure 11.2.3.1.1).
 */
export const HAZARD_CRITERIA: Record<HazardClass, HazardCriteria> = {
  light: {
    label: "Light Hazard",
    density: 0.10,
    area: 1500,
    maxCoveragePerHead: 225,
    maxSpacing: 15,
    hoseStreamGPM: 100,
    durationMinutes: 30,
  },
  ordinary_1: {
    label: "Ordinary Hazard Group 1",
    density: 0.15,
    area: 1500,
    maxCoveragePerHead: 130,
    maxSpacing: 15,
    hoseStreamGPM: 250,
    durationMinutes: 60,
  },
  ordinary_2: {
    label: "Ordinary Hazard Group 2",
    density: 0.20,
    area: 1500,
    maxCoveragePerHead: 130,
    maxSpacing: 15,
    hoseStreamGPM: 250,
    durationMinutes: 60,
  },
  extra_1: {
    label: "Extra Hazard Group 1",
    density: 0.30,
    area: 2500,
    maxCoveragePerHead: 100,
    maxSpacing: 12,
    hoseStreamGPM: 500,
    durationMinutes: 90,
  },
  extra_2: {
    label: "Extra Hazard Group 2",
    density: 0.40,
    area: 2500,
    maxCoveragePerHead: 100,
    maxSpacing: 12,
    hoseStreamGPM: 500,
    durationMinutes: 120,
  },
};

/**
 * Get the density/area design criteria for a hazard class.
 */
export function getHazardCriteria(hazard: HazardClass): HazardCriteria {
  return HAZARD_CRITERIA[hazard];
}

/**
 * Calculate minimum number of sprinklers in the design area.
 * @param designArea Design area in ft²
 * @param coveragePerHead Coverage area per sprinkler in ft²
 */
export function minSprinklersInArea(
  designArea: number,
  coveragePerHead: number,
): number {
  return Math.ceil(designArea / coveragePerHead);
}

/**
 * Calculate total system demand (sprinkler demand + hose stream).
 * @param sprinklerDemandGPM Total sprinkler flow in GPM
 * @param hoseStreamGPM Hose stream allowance in GPM
 * @returns Total system demand in GPM
 */
export function totalSystemDemand(
  sprinklerDemandGPM: number,
  hoseStreamGPM: number,
): number {
  return sprinklerDemandGPM + hoseStreamGPM;
}

/**
 * Calculate required water supply volume in gallons.
 * @param totalDemandGPM Total system demand in GPM
 * @param durationMinutes Required supply duration in minutes
 */
export function requiredSupplyVolume(
  totalDemandGPM: number,
  durationMinutes: number,
): number {
  return totalDemandGPM * durationMinutes;
}
