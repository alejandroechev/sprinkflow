import { DiagramCanvas } from "./components/diagram/DiagramCanvas";
import { StencilPanel } from "./components/toolbar/StencilPanel";
import { PropertyPanel } from "./components/panels/PropertyPanel";
import { ResultsSummary } from "./components/panels/ResultsSummary";
import { Toolbar } from "./components/toolbar/Toolbar";
import { useEditorStore } from "./store/editor-store";
import "./index.css";

export function App() {
  const nodes = useEditorStore((s) => s.project.nodes);
  const pipes = useEditorStore((s) => s.project.pipes);
  const zoom = useEditorStore((s) => s.zoom);

  return (
    <div className="app-layout">
      <Toolbar />
      <div className="main-area">
        <StencilPanel />
        <DiagramCanvas />
        <PropertyPanel />
      </div>
      <div className="status-bar">
        <span>Nodes: {nodes.length}</span>
        <span>Pipes: {pipes.length}</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <ResultsSummary />
      </div>
    </div>
  );
}
