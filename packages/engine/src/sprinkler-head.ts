/**
 * Sprinkler head discharge calculations.
 * K-factor equation: Q = K × √P (public domain fluid mechanics)
 */

/** Standard sprinkler K-factors (US customary, GPM/√psi) */
export const STANDARD_K_FACTORS = [2.8, 4.0, 5.6, 8.0, 11.2, 14.0, 16.8, 25.2] as const;

/**
 * Calculate sprinkler head discharge flow.
 * @param kFactor K-factor of the sprinkler head
 * @param pressurePsi Pressure at the sprinkler head in psi
 * @returns Flow rate in GPM
 */
export function sprinklerFlow(kFactor: number, pressurePsi: number): number {
  if (kFactor <= 0 || pressurePsi <= 0) return 0;
  return kFactor * Math.sqrt(pressurePsi);
}

/**
 * Calculate minimum required pressure at a sprinkler head for a given flow.
 * @param kFactor K-factor of the sprinkler head
 * @param flowGPM Required flow rate in GPM
 * @returns Required pressure in psi
 */
export function requiredPressure(kFactor: number, flowGPM: number): number {
  if (kFactor <= 0 || flowGPM <= 0) return 0;
  return Math.pow(flowGPM / kFactor, 2);
}

/**
 * Calculate required flow per sprinkler from design density and coverage area.
 * @param densityGPMperSqFt Design density in GPM/ft²
 * @param coverageAreaSqFt Coverage area per sprinkler in ft²
 * @returns Required flow in GPM per sprinkler
 */
export function flowFromDensity(
  densityGPMperSqFt: number,
  coverageAreaSqFt: number,
): number {
  return densityGPMperSqFt * coverageAreaSqFt;
}
