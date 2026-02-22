/**
 * Sample fire sprinkler projects for quick-start exploration.
 */
import type { Project } from "@sprinkler/engine";

export interface SampleProject {
  id: string;
  name: string;
  description: string;
  data: Project;
}

export const sampleProjects: SampleProject[] = [
  // ── 1. Light Hazard Office ──────────────────────────────────
  {
    id: "light-hazard-office",
    name: "Light Hazard Office",
    description: "4-head branch line, K=5.6, 1\" steel pipe. Simple tree system for an office space.",
    data: {
      id: "sample-light-office",
      name: "Light Hazard Office",
      description: "Simple 4-head branch line for a light hazard office occupancy",
      hazardClass: "light",
      designDensity: null,
      designArea: null,
      nodes: [
        { type: "supply", id: "ws1", label: "City Supply", x: 100, y: 300, elevation: 0, staticPressure: 80, residualPressure: 65, residualFlow: 500 },
        { type: "riser", id: "r1", label: "Riser", x: 250, y: 300, elevation: 0 },
        { type: "junction", id: "j1", label: "Branch Tee", x: 400, y: 300, elevation: 10 },
        { type: "sprinkler", id: "h1", label: "Head 1", x: 400, y: 150, elevation: 10, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h2", label: "Head 2", x: 550, y: 150, elevation: 10, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h3", label: "Head 3", x: 700, y: 150, elevation: 10, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h4", label: "Head 4", x: 850, y: 150, elevation: 10, kFactor: 5.6, coverageArea: 130 },
      ],
      pipes: [
        { id: "p1", fromNodeId: "ws1", toNodeId: "r1", nominalSize: "2\"", length: 5, material: "black_steel", fittings: ["gate_valve", "alarm_valve", "check_valve"] },
        { id: "p2", fromNodeId: "r1", toNodeId: "j1", nominalSize: "1-1/2\"", length: 15, material: "black_steel", fittings: ["elbow_90"] },
        { id: "p3", fromNodeId: "j1", toNodeId: "h1", nominalSize: "1\"", length: 6, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p4", fromNodeId: "h1", toNodeId: "h2", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p5", fromNodeId: "h2", toNodeId: "h3", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p6", fromNodeId: "h3", toNodeId: "h4", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
      ],
    },
  },

  // ── 2. Ordinary Hazard Group 1 ──────────────────────────────
  {
    id: "oh1-retail",
    name: "Ordinary Hazard Group 1 — Retail",
    description: "6-head system with cross main, K=5.6, 1.5\" branches, 2\" main. Retail store layout.",
    data: {
      id: "sample-oh1-retail",
      name: "OH-1 Retail Store",
      description: "6-head system with cross main for ordinary hazard group 1 retail",
      hazardClass: "ordinary_1",
      designDensity: null,
      designArea: null,
      nodes: [
        { type: "supply", id: "ws1", label: "City Supply", x: 50, y: 350, elevation: 0, staticPressure: 90, residualPressure: 70, residualFlow: 750 },
        { type: "riser", id: "r1", label: "Riser", x: 200, y: 350, elevation: 0 },
        { type: "junction", id: "cm1", label: "Cross Main Tee 1", x: 400, y: 350, elevation: 12 },
        { type: "junction", id: "cm2", label: "Cross Main Tee 2", x: 650, y: 350, elevation: 12 },
        { type: "sprinkler", id: "h1", label: "Head 1", x: 400, y: 150, elevation: 12, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h2", label: "Head 2", x: 550, y: 150, elevation: 12, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h3", label: "Head 3", x: 700, y: 150, elevation: 12, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h4", label: "Head 4", x: 400, y: 550, elevation: 12, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h5", label: "Head 5", x: 550, y: 550, elevation: 12, kFactor: 5.6, coverageArea: 130 },
        { type: "sprinkler", id: "h6", label: "Head 6", x: 700, y: 550, elevation: 12, kFactor: 5.6, coverageArea: 130 },
      ],
      pipes: [
        { id: "p1", fromNodeId: "ws1", toNodeId: "r1", nominalSize: "2-1/2\"", length: 5, material: "black_steel", fittings: ["gate_valve", "alarm_valve", "check_valve"] },
        { id: "p2", fromNodeId: "r1", toNodeId: "cm1", nominalSize: "2\"", length: 20, material: "black_steel", fittings: ["elbow_90"] },
        { id: "p3", fromNodeId: "cm1", toNodeId: "cm2", nominalSize: "2\"", length: 25, material: "black_steel", fittings: [] },
        { id: "p4", fromNodeId: "cm1", toNodeId: "h1", nominalSize: "1-1/2\"", length: 8, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p5", fromNodeId: "h1", toNodeId: "h2", nominalSize: "1-1/4\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p6", fromNodeId: "h2", toNodeId: "h3", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p7", fromNodeId: "cm2", toNodeId: "h4", nominalSize: "1-1/2\"", length: 8, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p8", fromNodeId: "h4", toNodeId: "h5", nominalSize: "1-1/4\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p9", fromNodeId: "h5", toNodeId: "h6", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
      ],
    },
  },

  // ── 3. Ordinary Hazard Group 2 Warehouse ────────────────────
  {
    id: "oh2-warehouse",
    name: "Ordinary Hazard Group 2 — Warehouse",
    description: "8-head system, K=8.0 large orifice, 2\" mains, long pipe runs with elevation changes.",
    data: {
      id: "sample-oh2-warehouse",
      name: "OH-2 Warehouse",
      description: "8-head large orifice system for ordinary hazard group 2 warehouse storage",
      hazardClass: "ordinary_2",
      designDensity: null,
      designArea: null,
      nodes: [
        { type: "supply", id: "ws1", label: "Fire Pump", x: 50, y: 400, elevation: 0, staticPressure: 120, residualPressure: 95, residualFlow: 1000 },
        { type: "riser", id: "r1", label: "Riser", x: 200, y: 400, elevation: 0 },
        { type: "junction", id: "cm1", label: "Cross Main Start", x: 400, y: 400, elevation: 18 },
        { type: "junction", id: "cm2", label: "Cross Main Mid", x: 600, y: 400, elevation: 18 },
        { type: "junction", id: "cm3", label: "Cross Main End", x: 800, y: 400, elevation: 20 },
        { type: "sprinkler", id: "h1", label: "Head 1", x: 400, y: 200, elevation: 18, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h2", label: "Head 2", x: 550, y: 200, elevation: 18, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h3", label: "Head 3", x: 700, y: 200, elevation: 19, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h4", label: "Head 4", x: 850, y: 200, elevation: 20, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h5", label: "Head 5", x: 400, y: 600, elevation: 18, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h6", label: "Head 6", x: 550, y: 600, elevation: 18, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h7", label: "Head 7", x: 700, y: 600, elevation: 19, kFactor: 8.0, coverageArea: 130 },
        { type: "sprinkler", id: "h8", label: "Head 8", x: 850, y: 600, elevation: 20, kFactor: 8.0, coverageArea: 130 },
      ],
      pipes: [
        { id: "p1", fromNodeId: "ws1", toNodeId: "r1", nominalSize: "3\"", length: 10, material: "black_steel", fittings: ["gate_valve", "alarm_valve", "check_valve"] },
        { id: "p2", fromNodeId: "r1", toNodeId: "cm1", nominalSize: "2-1/2\"", length: 30, material: "black_steel", fittings: ["elbow_90", "elbow_90"] },
        { id: "p3", fromNodeId: "cm1", toNodeId: "cm2", nominalSize: "2-1/2\"", length: 20, material: "black_steel", fittings: [] },
        { id: "p4", fromNodeId: "cm2", toNodeId: "cm3", nominalSize: "2\"", length: 20, material: "black_steel", fittings: [] },
        { id: "p5", fromNodeId: "cm1", toNodeId: "h1", nominalSize: "2\"", length: 10, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p6", fromNodeId: "h1", toNodeId: "h2", nominalSize: "1-1/2\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p7", fromNodeId: "h2", toNodeId: "h3", nominalSize: "1-1/4\"", length: 15, material: "black_steel", fittings: [] },
        { id: "p8", fromNodeId: "h3", toNodeId: "h4", nominalSize: "1\"", length: 15, material: "black_steel", fittings: [] },
        { id: "p9", fromNodeId: "cm2", toNodeId: "h5", nominalSize: "2\"", length: 10, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p10", fromNodeId: "h5", toNodeId: "h6", nominalSize: "1-1/2\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p11", fromNodeId: "h6", toNodeId: "h7", nominalSize: "1-1/4\"", length: 15, material: "black_steel", fittings: [] },
        { id: "p12", fromNodeId: "h7", toNodeId: "h8", nominalSize: "1\"", length: 15, material: "black_steel", fittings: [] },
      ],
    },
  },

  // ── 4. High-Rise System ─────────────────────────────────────
  {
    id: "high-rise",
    name: "High-Rise System",
    description: "Significant elevation head (120 ft), demonstrates elevation pressure impact. Strong fire pump supply.",
    data: {
      id: "sample-high-rise",
      name: "High-Rise System",
      description: "Sprinkler system at 120 ft elevation — demonstrates elevation pressure demands",
      hazardClass: "light",
      designDensity: null,
      designArea: null,
      nodes: [
        { type: "supply", id: "ws1", label: "Fire Pump", x: 100, y: 500, elevation: 0, staticPressure: 175, residualPressure: 140, residualFlow: 750 },
        { type: "riser", id: "r1", label: "Riser Base", x: 250, y: 500, elevation: 0 },
        { type: "junction", id: "j1", label: "Riser Top", x: 250, y: 300, elevation: 120 },
        { type: "junction", id: "j2", label: "Branch Tee", x: 450, y: 300, elevation: 120 },
        { type: "sprinkler", id: "h1", label: "Head 1", x: 450, y: 150, elevation: 120, kFactor: 5.6, coverageArea: 200 },
        { type: "sprinkler", id: "h2", label: "Head 2", x: 600, y: 150, elevation: 120, kFactor: 5.6, coverageArea: 200 },
        { type: "sprinkler", id: "h3", label: "Head 3", x: 750, y: 150, elevation: 120, kFactor: 5.6, coverageArea: 200 },
        { type: "sprinkler", id: "h4", label: "Head 4", x: 900, y: 150, elevation: 120, kFactor: 5.6, coverageArea: 200 },
      ],
      pipes: [
        { id: "p1", fromNodeId: "ws1", toNodeId: "r1", nominalSize: "4\"", length: 10, material: "black_steel", fittings: ["gate_valve", "alarm_valve", "check_valve"] },
        { id: "p2", fromNodeId: "r1", toNodeId: "j1", nominalSize: "4\"", length: 120, material: "black_steel", fittings: [] },
        { id: "p3", fromNodeId: "j1", toNodeId: "j2", nominalSize: "2\"", length: 20, material: "black_steel", fittings: ["elbow_90", "tee_branch"] },
        { id: "p4", fromNodeId: "j2", toNodeId: "h1", nominalSize: "1-1/2\"", length: 8, material: "black_steel", fittings: ["tee_branch"] },
        { id: "p5", fromNodeId: "h1", toNodeId: "h2", nominalSize: "1-1/4\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p6", fromNodeId: "h2", toNodeId: "h3", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
        { id: "p7", fromNodeId: "h3", toNodeId: "h4", nominalSize: "1\"", length: 12, material: "black_steel", fittings: [] },
      ],
    },
  },

  // ── 5. Residential NFPA 13D ─────────────────────────────────
  {
    id: "residential-13d",
    name: "Residential (NFPA 13D)",
    description: "2-head residential system, CPVC pipe (C=150), K=4.9 residential heads. Minimal system.",
    data: {
      id: "sample-residential",
      name: "Residential NFPA 13D",
      description: "2-head residential sprinkler system with CPVC piping per NFPA 13D",
      hazardClass: "light",
      designDensity: null,
      designArea: null,
      nodes: [
        { type: "supply", id: "ws1", label: "Domestic Supply", x: 100, y: 300, elevation: 0, staticPressure: 55, residualPressure: 40, residualFlow: 200 },
        { type: "riser", id: "r1", label: "Riser", x: 250, y: 300, elevation: 0 },
        { type: "sprinkler", id: "h1", label: "Bedroom Head", x: 450, y: 200, elevation: 8, kFactor: 4.9, coverageArea: 144 },
        { type: "sprinkler", id: "h2", label: "Living Room Head", x: 650, y: 200, elevation: 8, kFactor: 4.9, coverageArea: 196 },
      ],
      pipes: [
        { id: "p1", fromNodeId: "ws1", toNodeId: "r1", nominalSize: "1\"", length: 5, material: "cpvc", fittings: ["gate_valve"] },
        { id: "p2", fromNodeId: "r1", toNodeId: "h1", nominalSize: "1\"", length: 15, material: "cpvc", fittings: ["elbow_90", "elbow_90"] },
        { id: "p3", fromNodeId: "h1", toNodeId: "h2", nominalSize: "3/4\"", length: 14, material: "cpvc", fittings: ["tee_branch"] },
      ],
    },
  },
];
