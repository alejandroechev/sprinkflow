/**
 * ResultsSummary — system-level demand summary displayed in the status bar area.
 */
import { useEditorStore } from "../../store/editor-store";
import { getHazardCriteria } from "@sprinkler/engine";

export function ResultsSummary() {
  const result = useEditorStore((s) => s.result);
  const project = useEditorStore((s) => s.project);

  if (!result) return null;

  const hazard = getHazardCriteria(project.hazardClass);

  return (
    <div className="results-summary">
      <div className="result-item">
        <span className="label">Sprinkler Demand</span>
        <span className="value">{result.sprinklerDemandGPM.toFixed(0)} GPM @ {result.riserPressurePsi.toFixed(1)} psi</span>
      </div>
      <div className="result-item">
        <span className="label">Hose Stream</span>
        <span className="value">{hazard.hoseStreamGPM} GPM</span>
      </div>
      <div className="result-item">
        <span className="label">Total Demand</span>
        <span className="value">{result.totalDemandGPM.toFixed(0)} GPM</span>
      </div>
      {result.supplyAdequate !== null && (
        <div className={`result-item ${result.supplyAdequate ? "pass" : "fail"}`}>
          <span className="label">Supply</span>
          <span className="value">{result.supplyAdequate ? "✅ Adequate" : "❌ Inadequate"}</span>
        </div>
      )}
    </div>
  );
}
