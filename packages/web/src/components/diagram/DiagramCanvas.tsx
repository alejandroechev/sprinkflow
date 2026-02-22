/**
 * DiagramCanvas — SVG-based pipe network editor with drag-drop, pan, zoom, linking.
 */
import { useRef, useCallback, useState } from "react";
import { useEditorStore } from "../../store/editor-store";
import type { ProjectNode } from "@sprinkler/engine";

const GRID = 20;
const snap = (v: number) => Math.round(v / GRID) * GRID;

const NODE_ICONS: Record<string, { color: string; label: string; radius: number }> = {
  sprinkler: { color: "#ef4444", label: "🔴", radius: 12 },
  junction: { color: "#6366f1", label: "J", radius: 10 },
  riser: { color: "#22c55e", label: "R", radius: 14 },
  supply: { color: "#3b82f6", label: "W", radius: 14 },
};

export function DiagramCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const project = useEditorStore((s) => s.project);
  const pan = useEditorStore((s) => s.pan);
  const zoom = useEditorStore((s) => s.zoom);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedPipeId = useEditorStore((s) => s.selectedPipeId);
  const linkSourceId = useEditorStore((s) => s.linkSourceId);
  const result = useEditorStore((s) => s.result);
  const moveNode = useEditorStore((s) => s.moveNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const selectPipe = useEditorStore((s) => s.selectPipe);
  const addNode = useEditorStore((s) => s.addNode);
  const addPipe = useEditorStore((s) => s.addPipe);
  const startLinkFrom = useEditorStore((s) => s.startLinkFrom);
  const setPan = useEditorStore((s) => s.setPan);
  const setZoom = useEditorStore((s) => s.setZoom);

  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const svgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  const onNodeMouseDown = useCallback(
    (e: React.MouseEvent, node: ProjectNode) => {
      e.stopPropagation();
      if (e.button !== 0) return;

      if (linkSourceId) {
        // Complete a link
        if (linkSourceId !== node.id) {
          addPipe({
            id: crypto.randomUUID(),
            fromNodeId: linkSourceId,
            toNodeId: node.id,
            nominalSize: '1-1/4"',
            length: 20,
            material: "black_steel",
            fittings: [],
          });
        }
        startLinkFrom(null);
        return;
      }

      selectNode(node.id);
      setDragging({ id: node.id, ox: node.x, oy: node.y });
    },
    [linkSourceId, addPipe, startLinkFrom, selectNode],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) {
        const pt = svgPoint(e.clientX, e.clientY);
        moveNode(dragging.id, snap(pt.x), snap(pt.y));
      }
      if (panning) {
        setPan(
          panning.px + (e.clientX - panning.sx),
          panning.py + (e.clientY - panning.sy),
        );
      }
    },
    [dragging, panning, svgPoint, moveNode, setPan],
  );

  const onMouseUp = useCallback(() => {
    setDragging(null);
    setPanning(null);
  }, []);

  const onBgMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (linkSourceId) {
        startLinkFrom(null);
        return;
      }
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setPanning({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y });
        return;
      }
      selectNode(null);
      selectPipe(null);
    },
    [linkSourceId, startLinkFrom, pan, selectNode, selectPipe],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    },
    [zoom, setZoom],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("nodeType") as ProjectNode["type"];
      if (!nodeType) return;
      const pt = svgPoint(e.clientX, e.clientY);
      const id = crypto.randomUUID();

      const base = { id, label: nodeType === "sprinkler" ? `S${project.nodes.filter((n) => n.type === "sprinkler").length + 1}` : nodeType === "junction" ? `J${project.nodes.filter((n) => n.type === "junction").length + 1}` : nodeType === "riser" ? "Riser" : "Supply", x: snap(pt.x), y: snap(pt.y) };

      let node: ProjectNode;
      switch (nodeType) {
        case "sprinkler":
          node = { ...base, type: "sprinkler", kFactor: 5.6, coverageArea: 130, elevation: 10 };
          break;
        case "junction":
          node = { ...base, type: "junction", elevation: 10 };
          break;
        case "riser":
          node = { ...base, type: "riser", elevation: 0 };
          break;
        case "supply":
          node = { ...base, type: "supply", elevation: 0, staticPressure: 80, residualPressure: 60, residualFlow: 1000 };
          break;
        default:
          return;
      }
      addNode(node);
    },
    [svgPoint, project.nodes, addNode],
  );

  const nodeMap = new Map(project.nodes.map((n) => [n.id, n]));

  return (
    <div
      className="diagram-area"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={onBgMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        style={{ cursor: panning ? "grabbing" : linkSourceId ? "crosshair" : "default" }}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Grid */}
          <defs>
            <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
              <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="var(--grid-color, #e5e7eb)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid)" pointerEvents="none" />

          {/* Pipes */}
          {project.pipes.map((pipe) => {
            const from = nodeMap.get(pipe.fromNodeId);
            const to = nodeMap.get(pipe.toNodeId);
            if (!from || !to) return null;
            const isSelected = pipe.id === selectedPipeId;
            const pipeResult = result?.pipeResults.get(pipe.id);
            return (
              <g key={pipe.id} className="pipe-group" onClick={(e) => { e.stopPropagation(); selectPipe(pipe.id); }}>
                {/* Invisible wider hit area for easier clicking */}
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="transparent"
                  strokeWidth={14}
                  strokeLinecap="round"
                  style={{ cursor: "pointer" }}
                />
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isSelected ? "var(--accent, #6366f1)" : pipeResult && pipeResult.velocity > 20 ? "#ef4444" : "var(--pipe-color, #64748b)"}
                  strokeWidth={isSelected ? 4 : 2.5}
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                {/* Flow direction arrow */}
                <polygon
                  points="-5,-4 5,0 -5,4"
                  fill={isSelected ? "var(--accent)" : "var(--pipe-color, #64748b)"}
                  transform={`translate(${(from.x + to.x) / 2},${(from.y + to.y) / 2}) rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI})`}
                />
                {/* Pipe size label */}
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--text-muted, #94a3b8)"
                >
                  {pipe.nominalSize}
                </text>
                {pipeResult && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--text-muted)"
                  >
                    {pipeResult.flow.toFixed(1)} GPM · {pipeResult.totalLoss.toFixed(1)} psi
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {project.nodes.map((node) => {
            const style = NODE_ICONS[node.type] ?? NODE_ICONS.junction;
            const isSelected = node.id === selectedNodeId;
            const nodeResult = result?.nodeResults.get(node.id);
            return (
              <g
                key={node.id}
                className="node-group"
                onMouseDown={(e) => onNodeMouseDown(e, node)}
                style={{ cursor: dragging?.id === node.id ? "grabbing" : "pointer" }}
              >
                <circle
                  cx={node.x} cy={node.y} r={style.radius}
                  fill={style.color}
                  stroke={isSelected ? "var(--accent, #6366f1)" : "var(--border, #d1d5db)"}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={0.9}
                />
                {/* Node type indicator */}
                <text
                  x={node.x} y={node.y + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#fff"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {node.type === "sprinkler" ? "S" : node.type === "riser" ? "R" : node.type === "supply" ? "W" : "J"}
                </text>
                {/* Label */}
                <text
                  x={node.x} y={node.y - style.radius - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--text, #1e293b)"
                  className="node-label"
                >
                  {node.label}
                </text>
                {/* Ports for linking */}
                <circle
                  cx={node.x} cy={node.y + style.radius + 6}
                  r={4}
                  fill="var(--port-color, #a3e635)"
                  stroke="#fff" strokeWidth={1}
                  style={{ cursor: "crosshair" }}
                  onMouseDown={(e) => { e.stopPropagation(); startLinkFrom(node.id); }}
                />
                <circle
                  cx={node.x} cy={node.y - style.radius - 6}
                  r={4}
                  fill="var(--port-color, #a3e635)"
                  stroke="#fff" strokeWidth={1}
                  style={{ cursor: "crosshair" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (linkSourceId && linkSourceId !== node.id) {
                      addPipe({
                        id: crypto.randomUUID(),
                        fromNodeId: linkSourceId,
                        toNodeId: node.id,
                        nominalSize: '1-1/4"',
                        length: 20,
                        material: "black_steel",
                        fittings: [],
                      });
                      startLinkFrom(null);
                    }
                  }}
                />
                {/* Result badge */}
                {nodeResult && (
                  <g>
                    <rect
                      x={node.x + style.radius + 4}
                      y={node.y - 8}
                      width={58} height={16} rx={3}
                      fill="var(--surface, #f8fafc)"
                      stroke="var(--border)" strokeWidth={0.5}
                    />
                    <text
                      x={node.x + style.radius + 8}
                      y={node.y + 3}
                      fontSize={8}
                      fill="var(--text)"
                    >
                      {nodeResult.pressure.toFixed(1)} psi · {nodeResult.flow.toFixed(1)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
