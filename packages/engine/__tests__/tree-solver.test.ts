import { describe, it, expect } from "vitest";
import { solveTreeSystem } from "../src/tree-solver";
import type { Project, SprinklerHead, Junction, Riser, WaterSupply, PipeSegment } from "../src/project";

function makeHead(id: string, x: number, y: number, elevation = 10): SprinklerHead {
  return { type: "sprinkler", id, label: id, x, y, kFactor: 5.6, coverageArea: 130, elevation };
}

function makeJunction(id: string, x: number, y: number, elevation = 10): Junction {
  return { type: "junction", id, label: id, x, y, elevation };
}

function makeRiser(id: string, elevation = 0): Riser {
  return { type: "riser", id, label: "Riser", x: 0, y: 0, elevation };
}

function makeSupply(id: string): WaterSupply {
  return {
    type: "supply", id, label: "City Water", x: 0, y: 0,
    elevation: 0, staticPressure: 80, residualPressure: 60, residualFlow: 1000,
  };
}

function makePipe(id: string, from: string, to: string, length = 20): PipeSegment {
  return {
    id, fromNodeId: from, toNodeId: to,
    nominalSize: '1-1/4"', length, material: "black_steel", fittings: [],
  };
}

describe("Tree System Solver", () => {
  it("solves a single sprinkler head system", () => {
    const project: Project = {
      id: "test", name: "Test", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [
        makeRiser("riser"),
        makeHead("h1", 100, 100, 10),
      ],
      pipes: [
        makePipe("p1", "riser", "h1", 30),
      ],
    };

    const result = solveTreeSystem(project);
    expect(result.sprinklerDemandGPM).toBeGreaterThan(0);
    expect(result.riserPressurePsi).toBeGreaterThan(0);

    // Sprinkler should have required pressure
    const h1 = result.nodeResults.get("h1");
    expect(h1).toBeDefined();
    expect(h1!.flow).toBeGreaterThan(0);
    expect(h1!.pressure).toBeGreaterThan(0);

    // Pipe should have results
    const p1 = result.pipeResults.get("p1");
    expect(p1).toBeDefined();
    expect(p1!.flow).toBeGreaterThan(0);
    expect(p1!.frictionLoss).toBeGreaterThan(0);
    expect(p1!.velocity).toBeGreaterThan(0);
  });

  it("solves a branch with 2 sprinkler heads", () => {
    const project: Project = {
      id: "test", name: "Test", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [
        makeRiser("riser", 0),
        makeJunction("j1", 50, 50, 10),
        makeHead("h1", 100, 30, 10),
        makeHead("h2", 100, 70, 10),
      ],
      pipes: [
        makePipe("p-riser-j1", "riser", "j1", 30),
        makePipe("p-j1-h1", "j1", "h1", 15),
        makePipe("p-j1-h2", "j1", "h2", 15),
      ],
    };

    const result = solveTreeSystem(project);

    // Junction should have combined flow from both heads
    const j1 = result.nodeResults.get("j1");
    expect(j1).toBeDefined();
    const h1 = result.nodeResults.get("h1");
    const h2 = result.nodeResults.get("h2");
    expect(j1!.flow).toBeCloseTo(h1!.flow + h2!.flow, 1);

    // Riser pressure > junction pressure > head pressure
    const riser = result.nodeResults.get("riser");
    expect(riser!.pressure).toBeGreaterThan(j1!.pressure);

    // Total demand includes hose stream (250 GPM for OH-1)
    expect(result.totalDemandGPM).toBe(result.sprinklerDemandGPM + 250);
  });

  it("accounts for elevation change", () => {
    const lowHead: Project = {
      id: "t1", name: "Low", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [makeRiser("r", 0), makeHead("h", 0, 0, 0)],
      pipes: [makePipe("p", "r", "h", 20)],
    };
    const highHead: Project = {
      id: "t2", name: "High", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [makeRiser("r", 0), makeHead("h", 0, 0, 20)],
      pipes: [makePipe("p", "r", "h", 20)],
    };

    const lowResult = solveTreeSystem(lowHead);
    const highResult = solveTreeSystem(highHead);

    // Higher elevation requires more pressure at riser
    expect(highResult.riserPressurePsi).toBeGreaterThan(lowResult.riserPressurePsi);
    // Difference should be approximately 0.433 × 20 = 8.66 psi
    const diff = highResult.riserPressurePsi - lowResult.riserPressurePsi;
    expect(diff).toBeCloseTo(8.66, 0);
  });

  it("accounts for pipe fittings", () => {
    const noFittings: Project = {
      id: "t1", name: "No fittings", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [makeRiser("r", 0), makeHead("h", 0, 0, 0)],
      pipes: [{ ...makePipe("p", "r", "h", 20), fittings: [] }],
    };
    const withFittings: Project = {
      id: "t2", name: "With fittings", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [makeRiser("r", 0), makeHead("h", 0, 0, 0)],
      pipes: [{ ...makePipe("p", "r", "h", 20), fittings: ["elbow_90", "elbow_90", "tee_branch"] }],
    };

    const r1 = solveTreeSystem(noFittings);
    const r2 = solveTreeSystem(withFittings);

    // More fittings = more friction = higher riser pressure
    expect(r2.riserPressurePsi).toBeGreaterThan(r1.riserPressurePsi);
  });

  it("checks supply adequacy", () => {
    const project: Project = {
      id: "test", name: "Test", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [
        makeSupply("supply"),
        makeHead("h1", 100, 100, 10),
      ],
      pipes: [makePipe("p1", "supply", "h1", 30)],
    };

    const result = solveTreeSystem(project);
    expect(result.supplyAdequate).toBe(true); // 80 psi static should be plenty for 1 head
  });

  it("returns empty results for empty project", () => {
    const project: Project = {
      id: "test", name: "Empty", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [], pipes: [],
    };

    const result = solveTreeSystem(project);
    expect(result.sprinklerDemandGPM).toBe(0);
    expect(result.riserPressurePsi).toBe(0);
  });

  it("uses design density override when provided", () => {
    const defaultDensity: Project = {
      id: "t1", name: "Default", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [makeRiser("r", 0), makeHead("h", 0, 0, 0)],
      pipes: [makePipe("p", "r", "h", 20)],
    };
    const higherDensity: Project = {
      ...defaultDensity, id: "t2",
      designDensity: 0.25, // higher than OH-1's 0.15
    };

    const r1 = solveTreeSystem(defaultDensity);
    const r2 = solveTreeSystem(higherDensity);

    // Higher density = more flow = higher pressure
    expect(r2.sprinklerDemandGPM).toBeGreaterThan(r1.sprinklerDemandGPM);
  });

  it("handles a 4-head branch line system", () => {
    // Riser → J1 → J2 → J3
    //              |     |     |     → H4
    //              H1    H2    H3
    const project: Project = {
      id: "test", name: "4-head", description: "",
      hazardClass: "ordinary_1", designDensity: null, designArea: null,
      nodes: [
        makeRiser("riser", 0),
        makeJunction("j1", 20, 50, 10),
        makeJunction("j2", 40, 50, 10),
        makeJunction("j3", 60, 50, 10),
        makeHead("h1", 20, 80, 10),
        makeHead("h2", 40, 80, 10),
        makeHead("h3", 60, 80, 10),
        makeHead("h4", 80, 50, 10),
      ],
      pipes: [
        { ...makePipe("p0", "riser", "j1", 30), nominalSize: '2"' },
        { ...makePipe("p1", "j1", "j2", 12), nominalSize: '1-1/2"' },
        { ...makePipe("p2", "j2", "j3", 12), nominalSize: '1-1/4"' },
        makePipe("p3", "j1", "h1", 10),
        makePipe("p4", "j2", "h2", 10),
        makePipe("p5", "j3", "h3", 10),
        makePipe("p6", "j3", "h4", 10),
      ],
    };

    const result = solveTreeSystem(project);

    // All 4 heads should have flow
    for (const hId of ["h1", "h2", "h3", "h4"]) {
      const nr = result.nodeResults.get(hId);
      expect(nr).toBeDefined();
      expect(nr!.flow).toBeGreaterThan(0);
    }

    // Total flow should be sum of all heads
    const totalHeadFlow = ["h1", "h2", "h3", "h4"]
      .map((id) => result.nodeResults.get(id)!.flow)
      .reduce((a, b) => a + b, 0);
    expect(result.sprinklerDemandGPM).toBeCloseTo(totalHeadFlow, 0);

    // Riser pressure should be highest
    expect(result.riserPressurePsi).toBeGreaterThan(10);
  });
});
