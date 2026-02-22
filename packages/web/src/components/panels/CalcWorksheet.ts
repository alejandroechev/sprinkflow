/**
 * CalcWorksheet — NFPA 13 style hydraulic calculation worksheet.
 * Opens in a new print window with tabular pipe-by-pipe results.
 */
import type { Project, SystemResult } from "@sprinkler/engine";
import { getHazardCriteria, getPipeDiameter, C_FACTORS } from "@sprinkler/engine";

export function openCalcWorksheet(project: Project, result: SystemResult) {
  const hazard = getHazardCriteria(project.hazardClass);
  const nodeMap = new Map(project.nodes.map((n) => [n.id, n]));

  // Build pipe rows sorted by proximity to riser (upstream first)
  const pipeRows = project.pipes.map((pipe) => {
    const from = nodeMap.get(pipe.fromNodeId);
    const to = nodeMap.get(pipe.toNodeId);
    const pr = result.pipeResults.get(pipe.id);
    const toResult = result.nodeResults.get(pipe.toNodeId);
    const fromResult = result.nodeResults.get(pipe.fromNodeId);
    const diameter = getPipeDiameter(pipe.nominalSize) ?? 0;
    const cFactor = C_FACTORS[pipe.material];

    return {
      pipeId: pipe.id.slice(0, 8),
      from: from?.label ?? pipe.fromNodeId.slice(0, 8),
      to: to?.label ?? pipe.toNodeId.slice(0, 8),
      nominalSize: pipe.nominalSize,
      diameter: diameter.toFixed(3),
      cFactor,
      length: pipe.length.toFixed(1),
      fittings: pipe.fittings.length,
      flow: pr?.flow.toFixed(1) ?? "-",
      frictionPerFt: pr && pipe.length > 0 ? (pr.frictionLoss / pipe.length).toFixed(4) : "-",
      frictionTotal: pr?.frictionLoss.toFixed(2) ?? "-",
      elevation: pr?.elevationLoss.toFixed(2) ?? "-",
      totalLoss: pr?.totalLoss.toFixed(2) ?? "-",
      velocity: pr?.velocity.toFixed(1) ?? "-",
      pressureAt: toResult?.pressure.toFixed(1) ?? "-",
    };
  });

  // Node summary rows
  const nodeRows = project.nodes
    .filter((n) => n.type === "sprinkler")
    .map((n) => {
      const nr = result.nodeResults.get(n.id);
      return {
        label: n.label,
        type: n.type,
        kFactor: n.type === "sprinkler" ? n.kFactor : "-",
        coverage: n.type === "sprinkler" ? n.coverageArea : "-",
        elevation: n.elevation,
        pressure: nr?.pressure.toFixed(1) ?? "-",
        flow: nr?.flow.toFixed(1) ?? "-",
      };
    });

  const html = `<!DOCTYPE html>
<html><head>
<title>Hydraulic Calculation Worksheet — ${project.name}</title>
<style>
  body { font-family: "Courier New", monospace; font-size: 11px; margin: 20px; color: #000; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
  h2 { font-size: 13px; margin: 16px 0 6px; border-bottom: 1px solid #000; padding-bottom: 2px; }
  .header-info { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 12px; font-size: 11px; }
  .header-info span { display: block; }
  .header-info .label { font-weight: bold; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
  th, td { border: 1px solid #333; padding: 3px 5px; text-align: right; font-size: 10px; }
  th { background: #e5e5e5; font-weight: bold; text-align: center; }
  td:first-child, td:nth-child(2), td:nth-child(3) { text-align: left; }
  .summary-box { border: 2px solid #000; padding: 10px; margin-top: 12px; }
  .summary-row { display: flex; justify-content: space-between; padding: 2px 0; }
  .summary-row .val { font-weight: bold; }
  .pass { color: green; font-weight: bold; }
  .fail { color: red; font-weight: bold; }
  @media print { body { margin: 10mm; } button { display: none; } }
  .print-btn { position: fixed; top: 10px; right: 10px; padding: 8px 16px; font-size: 13px; cursor: pointer; }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">🖨 Print</button>
<h1>HYDRAULIC CALCULATION WORKSHEET</h1>
<h1 style="font-size:13px; font-weight:normal;">${project.name}</h1>

<div class="header-info">
  <div><span class="label">Occupancy Classification:</span> ${hazard.label}</div>
  <div><span class="label">Design Density:</span> ${(project.designDensity ?? hazard.density).toFixed(2)} GPM/ft²</div>
  <div><span class="label">Design Area:</span> ${(project.designArea ?? hazard.area).toLocaleString()} ft²</div>
  <div><span class="label">Hose Stream Allowance:</span> ${hazard.hoseStreamGPM} GPM</div>
  <div><span class="label">Number of Sprinklers:</span> ${project.nodes.filter((n) => n.type === "sprinkler").length}</div>
  <div><span class="label">Duration:</span> ${hazard.durationMinutes} min</div>
</div>

<h2>Sprinkler Head Summary</h2>
<table>
  <tr><th>Node</th><th>K-Factor</th><th>Coverage (ft²)</th><th>Elevation (ft)</th><th>Pressure (psi)</th><th>Flow (GPM)</th></tr>
  ${nodeRows.map((r) => `<tr><td>${r.label}</td><td>${r.kFactor}</td><td>${r.coverage}</td><td>${r.elevation}</td><td>${r.pressure}</td><td>${r.flow}</td></tr>`).join("\n  ")}
</table>

<h2>Pipe-by-Pipe Hydraulic Calculations</h2>
<table>
  <tr>
    <th>From</th><th>To</th><th>Pipe Size</th><th>ID (in)</th><th>C</th>
    <th>Length (ft)</th><th>Fittings</th><th>Flow (GPM)</th>
    <th>psi/ft</th><th>Friction (psi)</th><th>Elev (psi)</th>
    <th>Total Loss (psi)</th><th>Velocity (ft/s)</th><th>Pressure (psi)</th>
  </tr>
  ${pipeRows.map((r) => `<tr>
    <td>${r.from}</td><td>${r.to}</td><td>${r.nominalSize}</td><td>${r.diameter}</td><td>${r.cFactor}</td>
    <td>${r.length}</td><td>${r.fittings}</td><td>${r.flow}</td>
    <td>${r.frictionPerFt}</td><td>${r.frictionTotal}</td><td>${r.elevation}</td>
    <td>${r.totalLoss}</td><td>${r.velocity}</td><td>${r.pressureAt}</td>
  </tr>`).join("\n  ")}
</table>

<div class="summary-box">
  <h2 style="border:none; margin:0 0 6px;">System Demand Summary</h2>
  <div class="summary-row"><span>Sprinkler Demand:</span><span class="val">${result.sprinklerDemandGPM.toFixed(1)} GPM @ ${result.riserPressurePsi.toFixed(1)} psi</span></div>
  <div class="summary-row"><span>Hose Stream Allowance:</span><span class="val">${hazard.hoseStreamGPM} GPM</span></div>
  <div class="summary-row"><span>Total System Demand:</span><span class="val">${result.totalDemandGPM.toFixed(1)} GPM</span></div>
  <div class="summary-row"><span>Required Duration:</span><span class="val">${hazard.durationMinutes} min</span></div>
  <div class="summary-row"><span>Required Supply Volume:</span><span class="val">${(result.totalDemandGPM * hazard.durationMinutes).toLocaleString()} gallons</span></div>
  ${result.supplyAdequate !== null ? `<div class="summary-row"><span>Supply Adequacy:</span><span class="${result.supplyAdequate ? 'pass' : 'fail'}">${result.supplyAdequate ? '✓ ADEQUATE' : '✗ INADEQUATE'}</span></div>` : ""}
</div>

<p style="margin-top:16px; font-size:9px; color:#666;">
  Generated by SprinkFlow — Fire Sprinkler Hydraulic Calculator<br>
  Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
</p>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
