/**
 * Project model — nodes, links, and system metadata for a fire sprinkler system.
 */

import type { PipeMaterial, FittingType } from "./pipe-data";
import type { HazardClass } from "./nfpa13";

/** A sprinkler head node */
export interface SprinklerHead {
  type: "sprinkler";
  id: string;
  label: string;
  x: number;
  y: number;
  /** K-factor in GPM/√psi */
  kFactor: number;
  /** Coverage area per head in ft² */
  coverageArea: number;
  /** Elevation in feet (from reference datum) */
  elevation: number;
}

/** A pipe junction node (tee, cross, etc.) */
export interface Junction {
  type: "junction";
  id: string;
  label: string;
  x: number;
  y: number;
  elevation: number;
}

/** The system riser node */
export interface Riser {
  type: "riser";
  id: string;
  label: string;
  x: number;
  y: number;
  elevation: number;
}

/** Water supply source node */
export interface WaterSupply {
  type: "supply";
  id: string;
  label: string;
  x: number;
  y: number;
  /** Elevation in feet (from reference datum) */
  elevation: number;
  /** Static pressure in psi */
  staticPressure: number;
  /** Residual pressure in psi (at residual flow) */
  residualPressure: number;
  /** Residual flow in GPM */
  residualFlow: number;
}

export type ProjectNode = SprinklerHead | Junction | Riser | WaterSupply;

/** A pipe segment connecting two nodes */
export interface PipeSegment {
  id: string;
  /** Upstream node ID (closer to supply) */
  fromNodeId: string;
  /** Downstream node ID (closer to sprinkler heads) */
  toNodeId: string;
  /** Nominal pipe size (e.g., "2\"") */
  nominalSize: string;
  /** Actual pipe length in feet */
  length: number;
  /** Pipe material */
  material: PipeMaterial;
  /** Fittings on this segment */
  fittings: FittingType[];
}

/** Full project definition */
export interface Project {
  id: string;
  name: string;
  description: string;
  hazardClass: HazardClass;
  /** Design density override (GPM/ft²), or null to use hazard default */
  designDensity: number | null;
  /** Design area override (ft²), or null to use hazard default */
  designArea: number | null;
  nodes: ProjectNode[];
  pipes: PipeSegment[];
}

/** Results for a single node after hydraulic calculation */
export interface NodeResult {
  nodeId: string;
  /** Pressure at this node in psi */
  pressure: number;
  /** Flow through/from this node in GPM */
  flow: number;
}

/** Results for a single pipe segment */
export interface PipeResult {
  pipeId: string;
  /** Flow in GPM */
  flow: number;
  /** Friction loss in psi */
  frictionLoss: number;
  /** Elevation pressure change in psi */
  elevationLoss: number;
  /** Total pressure loss in psi */
  totalLoss: number;
  /** Velocity in ft/s */
  velocity: number;
}

/** System-level results */
export interface SystemResult {
  /** Total sprinkler demand in GPM */
  sprinklerDemandGPM: number;
  /** Pressure required at base of riser in psi */
  riserPressurePsi: number;
  /** Total demand including hose stream in GPM */
  totalDemandGPM: number;
  /** Per-node results */
  nodeResults: Map<string, NodeResult>;
  /** Per-pipe results */
  pipeResults: Map<string, PipeResult>;
  /** Whether supply meets demand */
  supplyAdequate: boolean | null;
}

/**
 * Create an empty project with defaults.
 */
export function emptyProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: "New Project",
    description: "",
    hazardClass: "ordinary_1",
    designDensity: null,
    designArea: null,
    nodes: [],
    pipes: [],
  };
}
