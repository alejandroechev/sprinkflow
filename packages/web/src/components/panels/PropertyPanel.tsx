/**
 * PropertyPanel — shows/edits properties of the selected node or pipe.
 */
import { useEditorStore } from "../../store/editor-store";
import { SCHEDULE_40_PIPES, C_FACTORS, STANDARD_K_FACTORS } from "@sprinkler/engine";
import type { PipeMaterial } from "@sprinkler/engine";

export function PropertyPanel() {
  const project = useEditorStore((s) => s.project);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedPipeId = useEditorStore((s) => s.selectedPipeId);
  const updateNode = useEditorStore((s) => s.updateNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const updatePipe = useEditorStore((s) => s.updatePipe);
  const removePipe = useEditorStore((s) => s.removePipe);
  const result = useEditorStore((s) => s.result);

  const selectedNode = selectedNodeId
    ? project.nodes.find((n) => n.id === selectedNodeId)
    : null;
  const selectedPipe = selectedPipeId
    ? project.pipes.find((p) => p.id === selectedPipeId)
    : null;

  if (selectedNode) {
    const nodeResult = result?.nodeResults.get(selectedNode.id);
    return (
      <div className="property-panel">
        <h3>{selectedNode.type}</h3>
        <label>Name<input value={selectedNode.label} onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })} /></label>
        <label>Elevation (ft)<input type="number" value={selectedNode.elevation} onChange={(e) => updateNode(selectedNode.id, { elevation: +e.target.value })} /></label>

        {selectedNode.type === "sprinkler" && (
          <>
            <label>K-Factor
              <select value={selectedNode.kFactor} onChange={(e) => updateNode(selectedNode.id, { kFactor: +e.target.value })}>
                {STANDARD_K_FACTORS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label>Coverage (ft²)<input type="number" value={selectedNode.coverageArea} onChange={(e) => updateNode(selectedNode.id, { coverageArea: +e.target.value })} /></label>
          </>
        )}

        {selectedNode.type === "supply" && (
          <>
            <label>Static Pressure (psi)<input type="number" value={selectedNode.staticPressure} onChange={(e) => updateNode(selectedNode.id, { staticPressure: +e.target.value })} /></label>
            <label>Residual Pressure (psi)<input type="number" value={selectedNode.residualPressure} onChange={(e) => updateNode(selectedNode.id, { residualPressure: +e.target.value })} /></label>
            <label>Residual Flow (GPM)<input type="number" value={selectedNode.residualFlow} onChange={(e) => updateNode(selectedNode.id, { residualFlow: +e.target.value })} /></label>
          </>
        )}

        {nodeResult && (
          <div className="result-section">
            <h4>Results</h4>
            <div className="result-badge"><span className="label">Pressure</span><span className="value">{nodeResult.pressure.toFixed(1)} psi</span></div>
            <div className="result-badge"><span className="label">Flow</span><span className="value">{nodeResult.flow.toFixed(1)} GPM</span></div>
          </div>
        )}

        <button className="btn-danger" onClick={() => removeNode(selectedNode.id)}>Delete Node</button>
      </div>
    );
  }

  if (selectedPipe) {
    const pipeResult = result?.pipeResults.get(selectedPipe.id);
    return (
      <div className="property-panel">
        <h3>Pipe</h3>
        <label>Nominal Size
          <select value={selectedPipe.nominalSize} onChange={(e) => updatePipe(selectedPipe.id, { nominalSize: e.target.value })}>
            {SCHEDULE_40_PIPES.map((p) => <option key={p.nominal} value={p.nominal}>{p.nominal} (ID: {p.internalDiameter}")</option>)}
          </select>
        </label>
        <label>Length (ft)<input type="number" value={selectedPipe.length} onChange={(e) => updatePipe(selectedPipe.id, { length: +e.target.value })} /></label>
        <label>Material
          <select value={selectedPipe.material} onChange={(e) => updatePipe(selectedPipe.id, { material: e.target.value as PipeMaterial })}>
            {Object.entries(C_FACTORS).map(([k, v]) => <option key={k} value={k}>{k.replace(/_/g, " ")} (C={v})</option>)}
          </select>
        </label>

        {pipeResult && (
          <div className="result-section">
            <h4>Results</h4>
            <div className="result-badge"><span className="label">Flow</span><span className="value">{pipeResult.flow.toFixed(1)} GPM</span></div>
            <div className="result-badge"><span className="label">Friction Loss</span><span className="value">{pipeResult.frictionLoss.toFixed(2)} psi</span></div>
            <div className="result-badge"><span className="label">Elevation</span><span className="value">{pipeResult.elevationLoss.toFixed(2)} psi</span></div>
            <div className="result-badge"><span className="label">Total Loss</span><span className="value">{pipeResult.totalLoss.toFixed(2)} psi</span></div>
            <div className="result-badge"><span className="label">Velocity</span><span className="value" style={pipeResult.velocity > 20 ? { color: 'var(--danger)' } : undefined}>{pipeResult.velocity.toFixed(1)} ft/s{pipeResult.velocity > 20 ? " ⚠️" : ""}</span></div>
          </div>
        )}

        <button className="btn-danger" onClick={() => removePipe(selectedPipe.id)}>Delete Pipe</button>
      </div>
    );
  }

  return (
    <div className="property-panel">
      <h3>Properties</h3>
      <p>Select a node or pipe to edit its properties</p>
    </div>
  );
}
