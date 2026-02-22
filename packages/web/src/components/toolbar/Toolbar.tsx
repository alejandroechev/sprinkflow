/**
 * Toolbar — project actions, simulation run, theme toggle.
 */
import { useCallback, useRef, useEffect, useState } from "react";
import { useEditorStore } from "../../store/editor-store";
import {
  solveTreeSystem,
  type Project,
  HAZARD_CRITERIA,
  type HazardClass,
} from "@sprinkler/engine";
import { openCalcWorksheet } from "../panels/CalcWorksheet";
import { sampleProjects } from "../../samples";

export function Toolbar() {
  const project = useEditorStore((s) => s.project);
  const setProject = useEditorStore((s) => s.setProject);
  const setResult = useEditorStore((s) => s.setResult);
  const result = useEditorStore((s) => s.result);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [samplesOpen, setSamplesOpen] = useState(false);
  const samplesRef = useRef<HTMLDivElement>(null);

  // Close samples dropdown on outside click
  useEffect(() => {
    if (!samplesOpen) return;
    const handler = (e: MouseEvent) => {
      if (samplesRef.current && !samplesRef.current.contains(e.target as Node)) setSamplesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [samplesOpen]);

  const onLoadSample = useCallback(
    (sampleId: string) => {
      const sample = sampleProjects.find((s) => s.id === sampleId);
      if (!sample) return;
      if (project.nodes.length > 0 && !confirm(`Load sample "${sample.name}"? Unsaved changes will be lost.`)) return;
      setProject(structuredClone(sample.data));
      setSamplesOpen(false);
    },
    [project, setProject],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const onRun = useCallback(() => {
    if (project.nodes.length === 0) { alert("No nodes in the project"); return; }
    try {
      const result = solveTreeSystem(project);
      setResult(result);
    } catch (err: any) {
      alert(`Calculation error: ${err.message}`);
    }
  }, [project, setResult]);

  const onSave = useCallback(() => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [project]);

  const onLoad = useCallback(() => { fileInputRef.current?.click(); }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const proj = JSON.parse(reader.result as string) as Project;
          setProject(proj);
        } catch { alert("Invalid project file"); }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setProject],
  );

  const onNew = useCallback(() => {
    if (project.nodes.length > 0 && !confirm("Create a new project? Unsaved changes will be lost.")) return;
    setProject({
      id: crypto.randomUUID(),
      name: "New Project",
      description: "",
      hazardClass: "ordinary_1",
      designDensity: null,
      designArea: null,
      nodes: [],
      pipes: [],
    });
  }, [project, setProject]);

  const onHazardChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setProject({ ...project, hazardClass: e.target.value as HazardClass });
    },
    [project, setProject],
  );

  return (
    <div className="toolbar">
      <h1>SprinkFlow</h1>
      <button onClick={onNew}>New</button>
      <button onClick={onLoad}>Open</button>
      <div className="samples-dropdown" ref={samplesRef} style={{ position: "relative", display: "inline-block" }}>
        <button onClick={() => setSamplesOpen((v) => !v)} title="Load a sample project">📂 Samples</button>
        {samplesOpen && (
          <div className="samples-menu" style={{
            position: "absolute", top: "100%", left: 0, zIndex: 100,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 280, padding: 4,
            color: "var(--text)",
          }}>
            {sampleProjects.map((s) => (
              <button
                key={s.id}
                className="sample-item"
                onClick={() => onLoadSample(s.id)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "6px 10px",
                  border: "none", background: "transparent", cursor: "pointer", borderRadius: 3,
                  fontSize: 13, color: "inherit",
                }}
                title={s.description}
              >
                <strong>{s.name}</strong>
                <br />
                <span style={{ fontSize: 11, opacity: 0.7 }}>{s.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={onSave}>Save</button>
      <button onClick={undo} title="Undo (Ctrl+Z)">↩</button>
      <button onClick={redo} title="Redo (Ctrl+Y)">↪</button>
      <button className="btn-primary" onClick={onRun}>▶ Calculate</button>
      <button onClick={() => result && openCalcWorksheet(project, result)} disabled={!result} title="Open printable calculation worksheet">📄 Worksheet</button>

      <select
        value={project.hazardClass}
        onChange={onHazardChange}
        className="hazard-select"
        title="Occupancy Hazard Classification"
      >
        {Object.entries(HAZARD_CRITERIA).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <div style={{ marginLeft: "auto" }} />
      <button onClick={() => window.open('/intro.html', '_blank')} title="Open fire sprinkler hydraulics guide">📖 Guide</button>
      <button onClick={() => window.open('https://github.com/alejandroechev/SprinkFlow/issues/new', '_blank')} title="Send feedback">💬 Feedback</button>
      <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={onFileChange} />
    </div>
  );
}
