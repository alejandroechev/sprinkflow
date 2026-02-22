/**
 * Supply vs. demand analysis — compare system hydraulic demand
 * against the available water supply curve.
 */

export interface SupplyPoint {
  /** Flow in GPM */
  flow: number;
  /** Available pressure in psi */
  pressure: number;
}

export interface DemandPoint {
  /** Flow in GPM */
  flow: number;
  /** Required pressure in psi */
  pressure: number;
}

export interface SupplyDemandResult {
  /** System demand point (sprinkler only) */
  sprinklerDemand: DemandPoint;
  /** System demand point (including hose stream) */
  totalDemand: DemandPoint;
  /** Does supply meet total demand? */
  adequate: boolean;
  /** Safety margin in psi (positive = supply exceeds demand) */
  marginPsi: number;
  /** Supply curve points for plotting */
  supplyCurve: SupplyPoint[];
}

/**
 * Calculate the available supply pressure at a given flow rate
 * using linear interpolation of a flow test.
 * @param staticPsi Static pressure (0 GPM)
 * @param residualPsi Residual pressure at test flow
 * @param residualFlow Test flow in GPM
 * @param targetFlow Flow to evaluate in GPM
 */
export function supplyPressureAtFlow(
  staticPsi: number,
  residualPsi: number,
  residualFlow: number,
  targetFlow: number,
): number {
  if (residualFlow <= 0) return staticPsi;
  const slope = (staticPsi - residualPsi) / residualFlow;
  return Math.max(0, staticPsi - slope * targetFlow);
}

/**
 * Generate a supply curve for plotting.
 */
export function generateSupplyCurve(
  staticPsi: number,
  residualPsi: number,
  residualFlow: number,
  maxFlow?: number,
): SupplyPoint[] {
  const max = maxFlow ?? residualFlow * 1.5;
  const points: SupplyPoint[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const flow = (max / steps) * i;
    points.push({
      flow,
      pressure: supplyPressureAtFlow(staticPsi, residualPsi, residualFlow, flow),
    });
  }
  return points;
}

/**
 * Evaluate supply vs demand.
 */
export function evaluateSupplyDemand(
  staticPsi: number,
  residualPsi: number,
  residualFlow: number,
  sprinklerDemandGPM: number,
  sprinklerDemandPsi: number,
  hoseStreamGPM: number,
): SupplyDemandResult {
  const totalFlow = sprinklerDemandGPM + hoseStreamGPM;
  const availableAtTotal = supplyPressureAtFlow(staticPsi, residualPsi, residualFlow, totalFlow);
  const margin = availableAtTotal - sprinklerDemandPsi;

  return {
    sprinklerDemand: { flow: sprinklerDemandGPM, pressure: sprinklerDemandPsi },
    totalDemand: { flow: totalFlow, pressure: sprinklerDemandPsi },
    adequate: margin >= 0,
    marginPsi: margin,
    supplyCurve: generateSupplyCurve(staticPsi, residualPsi, residualFlow, Math.max(totalFlow * 1.3, residualFlow)),
  };
}
