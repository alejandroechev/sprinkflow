/**
 * Pipe reference data — internal diameters, C-factors, and fitting equivalent lengths.
 * Data from ANSI/ASME B36.10M and NFPA 13 tables (widely published in textbooks).
 */

export interface PipeSpec {
  /** Nominal pipe size label */
  nominal: string;
  /** Internal diameter in inches (Schedule 40) */
  internalDiameter: number;
}

/** Schedule 40 steel pipe internal diameters (ANSI B36.10M) */
export const SCHEDULE_40_PIPES: PipeSpec[] = [
  { nominal: "3/4\"",  internalDiameter: 0.824 },
  { nominal: "1\"",    internalDiameter: 1.049 },
  { nominal: "1-1/4\"", internalDiameter: 1.380 },
  { nominal: "1-1/2\"", internalDiameter: 1.610 },
  { nominal: "2\"",    internalDiameter: 2.067 },
  { nominal: "2-1/2\"", internalDiameter: 2.469 },
  { nominal: "3\"",    internalDiameter: 3.068 },
  { nominal: "3-1/2\"", internalDiameter: 3.548 },
  { nominal: "4\"",    internalDiameter: 4.026 },
  { nominal: "5\"",    internalDiameter: 5.047 },
  { nominal: "6\"",    internalDiameter: 6.065 },
  { nominal: "8\"",    internalDiameter: 7.981 },
];

export type PipeMaterial = "black_steel" | "galvanized_steel" | "copper" | "cpvc" | "stainless_steel";

/** Hazen-Williams C-factors by pipe material */
export const C_FACTORS: Record<PipeMaterial, number> = {
  black_steel: 120,
  galvanized_steel: 120,
  copper: 150,
  cpvc: 150,
  stainless_steel: 150,
};

export type FittingType =
  | "elbow_90"
  | "elbow_45"
  | "tee_branch"
  | "tee_thru"
  | "gate_valve"
  | "butterfly_valve"
  | "check_valve"
  | "alarm_valve"
  | "reducer";

/**
 * Equivalent pipe lengths for fittings in feet, indexed by nominal pipe size.
 * Based on NFPA 13 Table 23.4.3.1.1 (C=120, Schedule 40 steel).
 * Values widely reproduced in fire protection engineering textbooks.
 */
export const FITTING_EQUIVALENT_LENGTHS: Record<string, Record<FittingType, number>> = {
  "3/4\"":   { elbow_90: 1, elbow_45: 1, tee_branch: 3, tee_thru: 1, gate_valve: 1, butterfly_valve: 0, check_valve: 5, alarm_valve: 0, reducer: 0 },
  "1\"":     { elbow_90: 2, elbow_45: 1, tee_branch: 5, tee_thru: 1, gate_valve: 1, butterfly_valve: 0, check_valve: 7, alarm_valve: 0, reducer: 0 },
  "1-1/4\"": { elbow_90: 3, elbow_45: 1, tee_branch: 6, tee_thru: 1, gate_valve: 1, butterfly_valve: 0, check_valve: 9, alarm_valve: 0, reducer: 0 },
  "1-1/2\"": { elbow_90: 3, elbow_45: 2, tee_branch: 7, tee_thru: 1, gate_valve: 1, butterfly_valve: 6, check_valve: 11, alarm_valve: 0, reducer: 0 },
  "2\"":     { elbow_90: 5, elbow_45: 3, tee_branch: 10, tee_thru: 2, gate_valve: 1, butterfly_valve: 8, check_valve: 14, alarm_valve: 0, reducer: 0 },
  "2-1/2\"": { elbow_90: 6, elbow_45: 3, tee_branch: 12, tee_thru: 3, gate_valve: 1, butterfly_valve: 9, check_valve: 16, alarm_valve: 0, reducer: 0 },
  "3\"":     { elbow_90: 7, elbow_45: 4, tee_branch: 15, tee_thru: 3, gate_valve: 1, butterfly_valve: 10, check_valve: 19, alarm_valve: 15, reducer: 0 },
  "3-1/2\"": { elbow_90: 8, elbow_45: 5, tee_branch: 17, tee_thru: 4, gate_valve: 1, butterfly_valve: 12, check_valve: 22, alarm_valve: 17, reducer: 0 },
  "4\"":     { elbow_90: 10, elbow_45: 5, tee_branch: 20, tee_thru: 4, gate_valve: 2, butterfly_valve: 14, check_valve: 24, alarm_valve: 20, reducer: 0 },
  "5\"":     { elbow_90: 12, elbow_45: 7, tee_branch: 25, tee_thru: 5, gate_valve: 2, butterfly_valve: 18, check_valve: 0, alarm_valve: 0, reducer: 0 },
  "6\"":     { elbow_90: 14, elbow_45: 8, tee_branch: 30, tee_thru: 6, gate_valve: 3, butterfly_valve: 21, check_valve: 0, alarm_valve: 0, reducer: 0 },
  "8\"":     { elbow_90: 18, elbow_45: 10, tee_branch: 35, tee_thru: 7, gate_valve: 4, butterfly_valve: 28, check_valve: 0, alarm_valve: 0, reducer: 0 },
};

/**
 * Calculate total equivalent length for a list of fittings.
 * @param nominalSize Nominal pipe size string (e.g., "2\"")
 * @param fittings Array of fitting types
 * @returns Total equivalent length in feet
 */
export function totalEquivalentLength(
  nominalSize: string,
  fittings: FittingType[],
): number {
  const table = FITTING_EQUIVALENT_LENGTHS[nominalSize];
  if (!table) return 0;
  return fittings.reduce((sum, f) => sum + (table[f] ?? 0), 0);
}

/**
 * Look up the internal diameter for a nominal pipe size.
 */
export function getPipeDiameter(nominalSize: string): number | undefined {
  return SCHEDULE_40_PIPES.find((p) => p.nominal === nominalSize)?.internalDiameter;
}

/**
 * Adjust fitting equivalent lengths for a different C-factor.
 * NFPA 13 Equation 23.4.3.1.3.1
 * @param equivalentLength Equivalent length from table (C=120)
 * @param targetC Target C-factor
 * @returns Adjusted equivalent length
 */
export function adjustEquivalentLength(equivalentLength: number, targetC: number): number {
  return equivalentLength * (120 / targetC);
}
