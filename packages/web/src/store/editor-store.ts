/**
 * Editor store — manages project state, selection, pan/zoom, results.
 */
import { create } from "zustand";
import type {
  Project,
  ProjectNode,
  PipeSegment,
  SystemResult,
} from "@sprinkler/engine";
import { emptyProject } from "@sprinkler/engine";

interface EditorState {
  project: Project;
  selectedNodeId: string | null;
  selectedPipeId: string | null;
  linkSourceId: string | null;
  pan: { x: number; y: number };
  zoom: number;
  result: SystemResult | null;
  theme: "light" | "dark";

  // History
  history: Project[];
  historyIndex: number;

  // Actions
  setProject: (p: Project) => void;
  addNode: (n: ProjectNode) => void;
  moveNode: (id: string, x: number, y: number) => void;
  updateNode: (id: string, patch: Partial<ProjectNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  addPipe: (p: PipeSegment) => void;
  updatePipe: (id: string, patch: Partial<PipeSegment>) => void;
  removePipe: (id: string) => void;
  selectPipe: (id: string | null) => void;

  startLinkFrom: (nodeId: string | null) => void;
  setPan: (x: number, y: number) => void;
  setZoom: (z: number) => void;
  setResult: (r: SystemResult | null) => void;
  toggleTheme: () => void;

  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function pushHistory(s: EditorState): Partial<EditorState> {
  const newHistory = s.history.slice(0, s.historyIndex + 1);
  newHistory.push(structuredClone(s.project));
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

const STORAGE_KEY = "SprinkFlow-project";

function loadPersistedProject(): Project {
  if (typeof window === "undefined") return emptyProject();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Project;
  } catch { /* ignore corrupt data */ }
  return emptyProject();
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: loadPersistedProject(),
  selectedNodeId: null,
  selectedPipeId: null,
  linkSourceId: null,
  pan: { x: 0, y: 0 },
  zoom: 1,
  result: null,
  theme:
    (typeof window !== "undefined" && localStorage.getItem("SprinkFlow-theme") as "light" | "dark") ||
    (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"),
  history: [],
  historyIndex: -1,

  setProject: (project) =>
    set((s) => ({ project, result: null, selectedNodeId: null, selectedPipeId: null, ...pushHistory(s) })),

  addNode: (node) =>
    set((s) => {
      const project = { ...s.project, nodes: [...s.project.nodes, node] };
      return { project, ...pushHistory(s) };
    }),

  moveNode: (id, x, y) =>
    set((s) => ({
      project: {
        ...s.project,
        nodes: s.project.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
      },
    })),

  updateNode: (id, patch) =>
    set((s) => {
      const project = {
        ...s.project,
        nodes: s.project.nodes.map((n) =>
          n.id === id ? { ...n, ...patch } as ProjectNode : n,
        ),
      };
      return { project, ...pushHistory(s) };
    }),

  removeNode: (id) =>
    set((s) => {
      const project = {
        ...s.project,
        nodes: s.project.nodes.filter((n) => n.id !== id),
        pipes: s.project.pipes.filter(
          (p) => p.fromNodeId !== id && p.toNodeId !== id,
        ),
      };
      return {
        project,
        selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
        ...pushHistory(s),
      };
    }),

  selectNode: (id) => set({ selectedNodeId: id, selectedPipeId: null }),

  addPipe: (pipe) =>
    set((s) => {
      const project = { ...s.project, pipes: [...s.project.pipes, pipe] };
      return { project, linkSourceId: null, ...pushHistory(s) };
    }),

  updatePipe: (id, patch) =>
    set((s) => {
      const project = {
        ...s.project,
        pipes: s.project.pipes.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        ),
      };
      return { project, ...pushHistory(s) };
    }),

  removePipe: (id) =>
    set((s) => {
      const project = {
        ...s.project,
        pipes: s.project.pipes.filter((p) => p.id !== id),
      };
      return {
        project,
        selectedPipeId: s.selectedPipeId === id ? null : s.selectedPipeId,
        ...pushHistory(s),
      };
    }),

  selectPipe: (id) => set({ selectedPipeId: id, selectedNodeId: null }),

  startLinkFrom: (nodeId) => set({ linkSourceId: nodeId }),
  setPan: (x, y) => set({ pan: { x, y } }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setResult: (result) => set({ result }),
  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("SprinkFlow-theme", theme);
      return { theme };
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex < 0) return s;
      const newHistory = [...s.history];
      if (newHistory.length <= s.historyIndex + 1) {
        newHistory.push(structuredClone(s.project));
      } else {
        newHistory[s.historyIndex + 1] = structuredClone(s.project);
      }
      const project = structuredClone(newHistory[s.historyIndex]);
      return { project, historyIndex: s.historyIndex - 1, history: newHistory, result: null };
    }),

  redo: () =>
    set((s) => {
      const target = s.historyIndex + 2;
      if (target >= s.history.length) return s;
      const project = structuredClone(s.history[target]);
      return { project, historyIndex: s.historyIndex + 1, result: null };
    }),
}));

// Debounced auto-save project to localStorage
let _saveTimer: ReturnType<typeof setTimeout> | undefined;
useEditorStore.subscribe((state) => {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
    } catch { /* quota exceeded — ignore */ }
  }, 500);
});
