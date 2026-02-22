import { describe, it, expect } from "vitest";
import { emptyProject } from "../src/project";

describe("Project Model", () => {
  it("creates an empty project with defaults", () => {
    const p = emptyProject();
    expect(p.id).toBeTruthy();
    expect(p.name).toBe("New Project");
    expect(p.hazardClass).toBe("ordinary_1");
    expect(p.nodes).toEqual([]);
    expect(p.pipes).toEqual([]);
    expect(p.designDensity).toBeNull();
    expect(p.designArea).toBeNull();
  });

  it("generates unique IDs", () => {
    const p1 = emptyProject();
    const p2 = emptyProject();
    expect(p1.id).not.toBe(p2.id);
  });
});
