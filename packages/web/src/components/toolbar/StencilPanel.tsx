/**
 * StencilPanel — draggable component palette for node types.
 */
const STENCIL_ITEMS = [
  { type: "sprinkler", label: "Sprinkler", icon: "S", color: "#ef4444" },
  { type: "junction", label: "Junction", icon: "J", color: "#6366f1" },
  { type: "riser", label: "Riser", icon: "R", color: "#22c55e" },
  { type: "supply", label: "Supply", icon: "W", color: "#3b82f6" },
] as const;

export function StencilPanel() {
  return (
    <div className="stencil-panel">
      <h3>Components</h3>
      {STENCIL_ITEMS.map((item) => (
        <div
          key={item.type}
          className="stencil-item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("nodeType", item.type);
          }}
        >
          <div
            className="stencil-icon"
            style={{ background: item.color }}
          >
            {item.icon}
          </div>
          {item.label}
        </div>
      ))}
      <h3>Instructions</h3>
      <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "0 8px" }}>
        Drag components onto the canvas. Click the bottom port of a node, then click the top port of another to create a pipe link.
      </p>
    </div>
  );
}
