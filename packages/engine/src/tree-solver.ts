/**
 * Tree system hydraulic solver — backward calculation from most remote
 * sprinkler head to the base of the riser.
 *
 * Algorithm:
 * 1. Build adjacency graph from pipes (supply → heads direction)
 * 2. Find leaf nodes (sprinkler heads with no downstream pipes)
 * 3. Starting from the most remote head, calculate required pressure
 * 4. Walk upstream, accumulating flow and pressure losses at each junction
 * 5. At the riser, report total system demand (flow @ pressure)
 */

import type {
  Project,
  ProjectNode,
  PipeSegment,
  NodeResult,
  PipeResult,
  SystemResult,
} from "./project";
import { frictionLossPerFoot, elevationPressure, pipeVelocity } from "./hazen-williams";
import { sprinklerFlow, requiredPressure, flowFromDensity } from "./sprinkler-head";
import { getPipeDiameter, C_FACTORS, totalEquivalentLength, adjustEquivalentLength } from "./pipe-data";
import { getHazardCriteria } from "./nfpa13";

/**
 * Solve a tree-type sprinkler system hydraulically.
 * Pipes flow from fromNodeId (upstream/supply side) to toNodeId (downstream/head side).
 */
export function solveTreeSystem(project: Project): SystemResult {
  const hazard = getHazardCriteria(project.hazardClass);
  const density = project.designDensity ?? hazard.density;
  const nodeMap = new Map<string, ProjectNode>();
  for (const n of project.nodes) nodeMap.set(n.id, n);

  // Build adjacency: for each node, which pipes lead downstream (to children)?
  // fromNodeId = upstream, toNodeId = downstream
  const downstreamPipes = new Map<string, PipeSegment[]>();
  const upstreamPipe = new Map<string, PipeSegment>(); // each node has at most one upstream pipe in a tree

  for (const pipe of project.pipes) {
    const list = downstreamPipes.get(pipe.fromNodeId) ?? [];
    list.push(pipe);
    downstreamPipes.set(pipe.fromNodeId, list);
    upstreamPipe.set(pipe.toNodeId, pipe);
  }

  // Find leaf nodes (sprinkler heads — nodes with no downstream pipes)
  const leafIds = project.nodes
    .filter((n) => n.type === "sprinkler" && !downstreamPipes.has(n.id))
    .map((n) => n.id);

  const nodeResults = new Map<string, NodeResult>();
  const pipeResults = new Map<string, PipeResult>();

  // For each sprinkler head, calculate minimum required flow and pressure
  for (const node of project.nodes) {
    if (node.type === "sprinkler") {
      const qMin = flowFromDensity(density, node.coverageArea);
      const pMin = requiredPressure(node.kFactor, qMin);
      nodeResults.set(node.id, { nodeId: node.id, pressure: pMin, flow: qMin });
    }
  }

  // Solve upstream from leaves using post-order traversal
  // We process nodes bottom-up: once all children of a junction are solved,
  // we can solve the junction.
  const solved = new Set<string>(leafIds);

  // Find the root node (supply or riser with no upstream pipe)
  const rootId = project.nodes.find(
    (n) => (n.type === "supply" || n.type === "riser") && !upstreamPipe.has(n.id),
  )?.id;

  if (!rootId) {
    return {
      sprinklerDemandGPM: 0,
      riserPressurePsi: 0,
      totalDemandGPM: 0,
      nodeResults,
      pipeResults,
      supplyAdequate: null,
    };
  }

  // BFS to get processing order (reverse = leaves first)
  const order: string[] = [];
  const visited = new Set<string>();
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    for (const pipe of downstreamPipes.get(id) ?? []) {
      queue.push(pipe.toNodeId);
    }
  }
  order.reverse(); // Process leaves first

  for (const nodeId of order) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    // If it's a sprinkler head, already solved above
    if (node.type === "sprinkler") continue;

    // This is a junction/riser/supply — accumulate from downstream children
    const childPipes = downstreamPipes.get(nodeId) ?? [];
    let maxPressureRequired = 0;
    let totalFlow = 0;

    for (const pipe of childPipes) {
      const childResult = nodeResults.get(pipe.toNodeId);
      if (!childResult) continue;

      const childNode = nodeMap.get(pipe.toNodeId);
      if (!childNode) continue;

      // Calculate pipe friction loss
      const diameter = getPipeDiameter(pipe.nominalSize);
      if (!diameter) continue;

      const cFactor = C_FACTORS[pipe.material];
      const fittingLength = totalEquivalentLength(pipe.nominalSize, pipe.fittings);
      const adjustedFittingLength = cFactor !== 120
        ? adjustEquivalentLength(fittingLength, cFactor)
        : fittingLength;
      const totalLength = pipe.length + adjustedFittingLength;

      const flow = childResult.flow;
      const hfPerFoot = frictionLossPerFoot(flow, cFactor, diameter);
      const frictionLoss = hfPerFoot * totalLength;

      // Elevation change (default to 0 if elevation undefined)
      const nodeElev = node.elevation ?? 0;
      const childElev = childNode.elevation ?? 0;
      const elevChange = childElev - nodeElev;
      const elevLoss = elevationPressure(elevChange);

      const totalLoss = frictionLoss + elevLoss;
      const velocity = pipeVelocity(flow, diameter);

      pipeResults.set(pipe.id, {
        pipeId: pipe.id,
        flow,
        frictionLoss,
        elevationLoss: elevLoss,
        totalLoss,
        velocity,
      });

      // Pressure required at this node to push flow to the child
      const pressureNeeded = childResult.pressure + totalLoss;
      if (pressureNeeded > maxPressureRequired) {
        maxPressureRequired = pressureNeeded;
      }
      totalFlow += flow;
    }

    // For balanced pressure at junctions: if multiple branches, the branch
    // requiring highest pressure governs. Other branches get excess pressure
    // which increases their flow (hydraulically balanced).
    // For MVP, we use the governing (max) pressure and sum flows.
    nodeResults.set(nodeId, {
      nodeId,
      pressure: maxPressureRequired,
      flow: totalFlow,
    });

    // Update child branches that have excess pressure — increase their flow
    for (const pipe of childPipes) {
      const childResult = nodeResults.get(pipe.toNodeId);
      const childNode = nodeMap.get(pipe.toNodeId);
      if (!childResult || !childNode) continue;

      const pipeRes = pipeResults.get(pipe.id);
      if (!pipeRes) continue;

      const availablePressure = maxPressureRequired - pipeRes.totalLoss;
      if (childNode.type === "sprinkler" && availablePressure > childResult.pressure) {
        // Sprinkler gets more flow due to excess pressure
        const actualFlow = sprinklerFlow(childNode.kFactor, availablePressure);
        nodeResults.set(childNode.id, {
          nodeId: childNode.id,
          pressure: availablePressure,
          flow: actualFlow,
        });
        // Recalculate pipe with updated flow
        const diameter = getPipeDiameter(pipe.nominalSize)!;
        const cFactor = C_FACTORS[pipe.material];
        const fittingLength = totalEquivalentLength(pipe.nominalSize, pipe.fittings);
        const adjustedFL = cFactor !== 120 ? adjustEquivalentLength(fittingLength, cFactor) : fittingLength;
        const totalLength = pipe.length + adjustedFL;
        const newFriction = frictionLossPerFoot(actualFlow, cFactor, diameter) * totalLength;
        const elevLoss = pipeRes.elevationLoss;
        pipeResults.set(pipe.id, {
          ...pipeRes,
          flow: actualFlow,
          frictionLoss: newFriction,
          totalLoss: newFriction + elevLoss,
          velocity: pipeVelocity(actualFlow, diameter),
        });
      }
    }

    // Recalculate total flow after balancing
    let updatedFlow = 0;
    for (const pipe of childPipes) {
      const pr = pipeResults.get(pipe.id);
      if (pr) updatedFlow += pr.flow;
    }
    const nr = nodeResults.get(nodeId)!;
    nodeResults.set(nodeId, { ...nr, flow: updatedFlow });
  }

  const riserResult = nodeResults.get(rootId);
  const sprinklerDemand = riserResult?.flow ?? 0;
  const riserPressure = riserResult?.pressure ?? 0;
  const totalDemand = sprinklerDemand + hazard.hoseStreamGPM;

  // Check supply adequacy
  let supplyAdequate: boolean | null = null;
  const supplyNode = project.nodes.find((n) => n.type === "supply");
  if (supplyNode && supplyNode.type === "supply") {
    // Simple linear interpolation of water supply curve
    // At 0 GPM → static pressure, at residualFlow → residualPressure
    const availablePressure =
      supplyNode.staticPressure -
      ((supplyNode.staticPressure - supplyNode.residualPressure) / supplyNode.residualFlow) *
        totalDemand;
    supplyAdequate = availablePressure >= riserPressure;
  }

  return {
    sprinklerDemandGPM: sprinklerDemand,
    riserPressurePsi: riserPressure,
    totalDemandGPM: totalDemand,
    nodeResults,
    pipeResults,
    supplyAdequate,
  };
}
