/**
 * Hazen-Williams friction loss calculation for fire sprinkler pipe segments.
 * All equations are public domain — standard fluid mechanics.
 */

/**
 * Calculate friction loss per foot of pipe using the Hazen-Williams equation.
 * @param flow Flow rate in GPM
 * @param cFactor Pipe roughness coefficient (e.g., 120 for steel)
 * @param diameterInches Internal pipe diameter in inches
 * @returns Friction loss in psi per foot of pipe
 */
export function frictionLossPerFoot(
  flow: number,
  cFactor: number,
  diameterInches: number,
): number {
  if (flow <= 0 || cFactor <= 0 || diameterInches <= 0) return 0;
  return (
    4.52 *
    Math.pow(flow, 1.85) /
    (Math.pow(cFactor, 1.85) * Math.pow(diameterInches, 4.87))
  );
}

/**
 * Calculate total friction loss for a pipe segment.
 * @param flow Flow rate in GPM
 * @param cFactor Pipe roughness coefficient
 * @param diameterInches Internal pipe diameter in inches
 * @param lengthFeet Total equivalent length (pipe + fittings) in feet
 * @returns Total friction loss in psi
 */
export function pipeSegmentFrictionLoss(
  flow: number,
  cFactor: number,
  diameterInches: number,
  lengthFeet: number,
): number {
  return frictionLossPerFoot(flow, cFactor, diameterInches) * lengthFeet;
}

/**
 * Calculate elevation pressure change.
 * @param elevationChangeFeet Elevation change in feet (positive = uphill)
 * @returns Pressure change in psi (positive = pressure loss going uphill)
 */
export function elevationPressure(elevationChangeFeet: number): number {
  return 0.433 * elevationChangeFeet;
}

/**
 * Calculate pipe velocity.
 * @param flow Flow rate in GPM
 * @param diameterInches Internal pipe diameter in inches
 * @returns Velocity in ft/s
 */
export function pipeVelocity(flow: number, diameterInches: number): number {
  if (diameterInches <= 0) return 0;
  return flow / (2.448 * diameterInches * diameterInches);
}
