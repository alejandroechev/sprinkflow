/**
 * SprinkFlow — Comprehensive Playwright E2E Tests
 *
 * Tests cover: Samples dropdown, core workflow, toolbar features,
 * property panel, calculation, edge cases.
 */
import { test, expect, type Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────
async function waitForApp(page: Page) {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("SprinkFlow");
}

function nodeCount(page: Page) {
  return page.locator(".status-bar span").first();
}

function pipeCount(page: Page) {
  return page.locator(".status-bar span").nth(1);
}

// ═══════════════════════════════════════════════════════════════
// 1. SAMPLES DROPDOWN
// ═══════════════════════════════════════════════════════════════
test.describe("Samples Dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test("Samples button is visible in toolbar", async ({ page }) => {
    const samplesBtn = page.locator("button", { hasText: "Samples" });
    await expect(samplesBtn).toBeVisible();
  });

  test("Clicking Samples opens dropdown menu", async ({ page }) => {
    await page.click("button:has-text('Samples')");
    await expect(page.locator(".samples-menu")).toBeVisible();
  });

  test("Dropdown shows exactly 5 sample projects", async ({ page }) => {
    await page.click("button:has-text('Samples')");
    const items = page.locator(".samples-menu .sample-item");
    await expect(items).toHaveCount(5);
  });

  test("Dropdown lists expected sample names", async ({ page }) => {
    await page.click("button:has-text('Samples')");
    const names = [
      "Light Hazard Office",
      "Ordinary Hazard Group 1 — Retail",
      "Ordinary Hazard Group 2 — Warehouse",
      "High-Rise System",
      "Residential (NFPA 13D)",
    ];
    for (const name of names) {
      await expect(page.locator(".samples-menu", { hasText: name })).toBeVisible();
    }
  });

  test("Clicking outside closes the dropdown", async ({ page }) => {
    await page.click("button:has-text('Samples')");
    await expect(page.locator(".samples-menu")).toBeVisible();
    // Click on the canvas area to close
    await page.locator(".diagram-area").click({ position: { x: 400, y: 400 } });
    await expect(page.locator(".samples-menu")).not.toBeVisible();
  });

  // ── Load each sample and verify node/pipe counts ──
  const sampleExpectations = [
    { name: "Light Hazard Office", nodes: 7, pipes: 6 },
    { name: "Ordinary Hazard Group 1", nodes: 10, pipes: 9 },
    { name: "Ordinary Hazard Group 2", nodes: 13, pipes: 12 },
    { name: "High-Rise System", nodes: 8, pipes: 7 },
    { name: "Residential (NFPA 13D)", nodes: 4, pipes: 3 },
  ];

  for (const sample of sampleExpectations) {
    test(`Load "${sample.name}" → ${sample.nodes} nodes, ${sample.pipes} pipes`, async ({ page }) => {
      // Accept confirm dialog
      page.on("dialog", (d) => d.accept());
      await page.click("button:has-text('Samples')");
      await page.locator(".sample-item", { hasText: sample.name }).click();

      // Dropdown should close
      await expect(page.locator(".samples-menu")).not.toBeVisible();

      // Verify counts in status bar
      await expect(nodeCount(page)).toHaveText(`Nodes: ${sample.nodes}`);
      await expect(pipeCount(page)).toHaveText(`Pipes: ${sample.pipes}`);

      // Verify SVG nodes rendered
      const svgNodes = page.locator("svg .node-group");
      await expect(svgNodes).toHaveCount(sample.nodes);
    });
  }

  test("Rapid sample switching does not crash", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    const names = [
      "Light Hazard Office",
      "Residential",
      "High-Rise",
      "Ordinary Hazard Group 2",
      "Light Hazard Office",
    ];
    for (const name of names) {
      await page.click("button:has-text('Samples')");
      await page.locator(".sample-item", { hasText: name }).click();
      // Small wait to let React re-render
      await page.waitForTimeout(100);
    }
    // Should end on Light Hazard Office
    await expect(nodeCount(page)).toHaveText("Nodes: 7");
    // App should still be responsive
    await expect(page.locator("h1")).toHaveText("SprinkFlow");
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. CORE WORKFLOW — BUILDING A SYSTEM
// ═══════════════════════════════════════════════════════════════
test.describe("Core Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test("Drag sprinkler head from stencil → node appears on canvas", async ({ page }) => {
    await expect(nodeCount(page)).toHaveText("Nodes: 0");

    const source = page.locator(".stencil-item", { hasText: "Sprinkler" });
    const target = page.locator(".diagram-area svg");

    await source.dragTo(target, { targetPosition: { x: 300, y: 300 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");
    // SVG should have a node group
    await expect(page.locator("svg .node-group")).toHaveCount(1);
  });

  test("Drag junction → node appears", async ({ page }) => {
    const source = page.locator(".stencil-item", { hasText: "Junction" });
    const target = page.locator(".diagram-area svg");
    await source.dragTo(target, { targetPosition: { x: 200, y: 200 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");
  });

  test("Drag supply node → node appears", async ({ page }) => {
    const source = page.locator(".stencil-item", { hasText: "Supply" });
    const target = page.locator(".diagram-area svg");
    await source.dragTo(target, { targetPosition: { x: 100, y: 300 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");
  });

  test("Drag riser → node appears", async ({ page }) => {
    const source = page.locator(".stencil-item", { hasText: "Riser" });
    const target = page.locator(".diagram-area svg");
    await source.dragTo(target, { targetPosition: { x: 150, y: 250 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");
  });

  test("Load sample then Calculate → results displayed", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    // Load the simple residential sample
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();

    // Click Calculate
    await page.click("button:has-text('Calculate')");

    // Results summary should appear in status bar
    await expect(page.locator(".results-summary")).toBeVisible();
    await expect(page.locator(".results-summary .result-item").first()).toBeVisible();

    // Should show sprinkler demand
    await expect(page.locator(".results-summary", { hasText: "Sprinkler Demand" })).toBeVisible();
    // Should show total demand
    await expect(page.locator(".results-summary", { hasText: "Total Demand" })).toBeVisible();
    // Supply adequacy
    await expect(page.locator(".results-summary", { hasText: "Supply" })).toBeVisible();
  });

  test("All sample projects calculate successfully", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    const samples = [
      "Light Hazard Office",
      "Ordinary Hazard Group 1",
      "Ordinary Hazard Group 2",
      "High-Rise",
      "Residential",
    ];
    for (const name of samples) {
      await page.click("button:has-text('Samples')");
      await page.locator(".sample-item", { hasText: name }).click();
      await page.click("button:has-text('Calculate')");
      // Verify results appear (no alert = no error)
      await expect(page.locator(".results-summary")).toBeVisible();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. PROPERTY PANEL
// ═══════════════════════════════════════════════════════════════
test.describe("Property Panel", () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test("Default state shows 'Select a node or pipe'", async ({ page }) => {
    await expect(page.locator(".property-panel")).toContainText("Select a node or pipe");
  });

  test("Click node in sample → property panel shows node type", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();

    // Click a sprinkler node in the SVG
    const nodeGroup = page.locator("svg .node-group").first();
    await nodeGroup.click();

    // Property panel should show node type header
    const panel = page.locator(".property-panel");
    await expect(panel.locator("h3")).toBeVisible();
  });

  test("Sprinkler node shows K-Factor selector", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();

    // Click the first sprinkler (find .node-group with "S" text — node index 2 in residential)
    // Residential has: supply, riser, sprinkler, sprinkler → sprinklers are index 2,3
    const sprinklerNode = page.locator("svg .node-group").nth(2);
    await sprinklerNode.click();

    await expect(page.locator(".property-panel")).toContainText("K-Factor");
    await expect(page.locator(".property-panel select").first()).toBeVisible();
  });

  test("Pipe shows nominal size and material selectors", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();

    // Click a pipe in SVG
    const pipeGroup = page.locator("svg .pipe-group").first();
    await pipeGroup.click();

    const panel = page.locator(".property-panel");
    await expect(panel).toContainText("Nominal Size");
    await expect(panel).toContainText("Material");
    await expect(panel).toContainText("Length");
  });

  test("After Calculate, clicking node shows result badges", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await page.click("button:has-text('Calculate')");

    // Click a sprinkler node
    const sprinklerNode = page.locator("svg .node-group").nth(3);
    await sprinklerNode.click();

    // Result section in property panel
    await expect(page.locator(".property-panel .result-section")).toBeVisible();
    await expect(page.locator(".property-panel")).toContainText("Pressure");
    await expect(page.locator(".property-panel")).toContainText("psi");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. TOOLBAR FEATURES
// ═══════════════════════════════════════════════════════════════
test.describe("Toolbar Features", () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page);
  });

  test("New button exists and is clickable", async ({ page }) => {
    const btn = page.locator("button", { hasText: "New" });
    await expect(btn).toBeVisible();
  });

  test("Open button exists", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Open" })).toBeVisible();
  });

  test("Save button exists", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Save" })).toBeVisible();
  });

  test("Undo/Redo buttons exist", async ({ page }) => {
    await expect(page.locator("button[title*='Undo']")).toBeVisible();
    await expect(page.locator("button[title*='Redo']")).toBeVisible();
  });

  test("Calculate button exists with primary styling", async ({ page }) => {
    const btn = page.locator("button.btn-primary", { hasText: "Calculate" });
    await expect(btn).toBeVisible();
  });

  test("Hazard class selector shows options", async ({ page }) => {
    const select = page.locator("select.hazard-select");
    await expect(select).toBeVisible();
    // Should have multiple hazard class options
    const options = select.locator("option");
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("Loading sample changes hazard class selector", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    // Load OH-2 warehouse (hazardClass: ordinary_2)
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Ordinary Hazard Group 2" }).click();
    const select = page.locator("select.hazard-select");
    await expect(select).toHaveValue("ordinary_2");

    // Load residential (hazardClass: light)
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();
    await expect(select).toHaveValue("light");
  });

  test("Theme toggle button works", async ({ page }) => {
    const themeBtn = page.locator("button.theme-toggle");
    await expect(themeBtn).toBeVisible();

    // Get initial theme
    const initial = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));

    // Click toggle
    await themeBtn.click();
    const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(after).not.toEqual(initial);

    // Click again to toggle back
    await themeBtn.click();
    const restored = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(restored).toEqual(initial);
  });

  test("Guide button exists", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Guide" })).toBeVisible();
  });

  test("Worksheet button disabled when no results", async ({ page }) => {
    const btn = page.locator("button", { hasText: "Worksheet" });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test("Worksheet button enabled after Calculate", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await page.click("button:has-text('Calculate')");

    const btn = page.locator("button", { hasText: "Worksheet" });
    await expect(btn).toBeEnabled();
  });

  test("Undo reverts adding a node", async ({ page }) => {
    // Add a node
    const source = page.locator(".stencil-item", { hasText: "Sprinkler" });
    const target = page.locator(".diagram-area svg");
    await source.dragTo(target, { targetPosition: { x: 300, y: 300 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");

    // Undo
    await page.click("button[title*='Undo']");
    await expect(nodeCount(page)).toHaveText("Nodes: 0");
  });

  test("New button resets project", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    // Load a sample
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();
    await expect(nodeCount(page)).toHaveText("Nodes: 4");

    // Click New
    await page.click("button:has-text('New')");
    await expect(nodeCount(page)).toHaveText("Nodes: 0");
    await expect(pipeCount(page)).toHaveText("Pipes: 0");
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. SUPPLY VS DEMAND
// ═══════════════════════════════════════════════════════════════
test.describe("Supply vs Demand", () => {
  test("Light hazard office → supply adequate", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await page.click("button:has-text('Calculate')");

    await expect(page.locator(".results-summary")).toContainText("Adequate");
  });

  test("Results show GPM and psi values", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await page.click("button:has-text('Calculate')");

    await expect(page.locator(".results-summary")).toContainText("GPM");
    await expect(page.locator(".results-summary")).toContainText("psi");
  });

  test("Hose stream allowance shown", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await page.click("button:has-text('Calculate')");

    await expect(page.locator(".results-summary")).toContainText("Hose Stream");
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. EDGE CASES
// ═══════════════════════════════════════════════════════════════
test.describe("Edge Cases", () => {
  test("Calculate with no nodes → alert error", async ({ page }) => {
    await waitForApp(page);
    let dialogMsg = "";
    page.on("dialog", async (d) => {
      dialogMsg = d.message();
      await d.accept();
    });
    await page.click("button:has-text('Calculate')");
    expect(dialogMsg).toContain("No nodes");
  });

  test("Single sprinkler head, no pipe → handles gracefully", async ({ page }) => {
    await waitForApp(page);
    // Add just one sprinkler
    const source = page.locator(".stencil-item", { hasText: "Sprinkler" });
    const target = page.locator(".diagram-area svg");
    await source.dragTo(target, { targetPosition: { x: 300, y: 300 } });
    await expect(nodeCount(page)).toHaveText("Nodes: 1");

    let dialogMsg = "";
    page.on("dialog", async (d) => {
      dialogMsg = d.message();
      await d.accept();
    });
    await page.click("button:has-text('Calculate')");
    // Should either show an error alert or handle gracefully (not crash)
    // The app may alert with a calculation error or "no supply node"
    // Either way the page should remain functional
    await expect(page.locator("h1")).toHaveText("SprinkFlow");
  });

  test("Delete a node removes connected pipes", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();
    await expect(nodeCount(page)).toHaveText("Nodes: 4");
    await expect(pipeCount(page)).toHaveText("Pipes: 3");

    // Click a sprinkler node (node index 2)
    await page.locator("svg .node-group").nth(2).click();
    // Delete it
    await page.click("button:has-text('Delete Node')");

    // Node count should decrease
    await expect(nodeCount(page)).toHaveText("Nodes: 3");
    // Pipes connected to deleted node should also be removed
    const pipeCountVal = await pipeCount(page).textContent();
    const pipes = parseInt(pipeCountVal!.replace("Pipes: ", ""));
    expect(pipes).toBeLessThan(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. STENCIL PANEL
// ═══════════════════════════════════════════════════════════════
test.describe("Stencil Panel", () => {
  test("All 4 component types visible", async ({ page }) => {
    await waitForApp(page);
    const panel = page.locator(".stencil-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator(".stencil-item")).toHaveCount(4);
    await expect(panel).toContainText("Sprinkler");
    await expect(panel).toContainText("Junction");
    await expect(panel).toContainText("Riser");
    await expect(panel).toContainText("Supply");
  });

  test("Instructions text visible", async ({ page }) => {
    await waitForApp(page);
    await expect(page.locator(".stencil-panel")).toContainText("Drag components");
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. STATUS BAR
// ═══════════════════════════════════════════════════════════════
test.describe("Status Bar", () => {
  test("Shows node and pipe counts", async ({ page }) => {
    await waitForApp(page);
    await expect(nodeCount(page)).toHaveText("Nodes: 0");
    await expect(pipeCount(page)).toHaveText("Pipes: 0");
  });

  test("Shows zoom level", async ({ page }) => {
    await waitForApp(page);
    await expect(page.locator(".status-bar")).toContainText("Zoom: 100%");
  });

  test("Counts update when sample loaded", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Light Hazard" }).click();
    await expect(nodeCount(page)).toHaveText("Nodes: 7");
    await expect(pipeCount(page)).toHaveText("Pipes: 6");
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. THEME PERSISTENCE & TEXT SELECTION
// ═══════════════════════════════════════════════════════════════
test.describe("Theme Persistence", () => {
  test("Theme persists in localStorage across reload", async ({ page }) => {
    await waitForApp(page);
    const initial = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));

    // Toggle theme
    await page.click("button.theme-toggle");
    const toggled = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(toggled).not.toEqual(initial);

    // Verify localStorage
    const stored = await page.evaluate(() => localStorage.getItem("SprinkFlow-theme"));
    expect(stored).toEqual(toggled);

    // Reload and verify theme is restored
    await page.reload();
    await expect(page.locator("h1")).toHaveText("SprinkFlow");
    const afterReload = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(afterReload).toEqual(toggled);
  });
});

test.describe("No Text Selection on Drag", () => {
  test("Diagram area has user-select: none", async ({ page }) => {
    await waitForApp(page);
    const userSelect = await page.locator(".diagram-area").evaluate(
      (el) => getComputedStyle(el).userSelect || (getComputedStyle(el) as any).webkitUserSelect
    );
    expect(userSelect).toBe("none");
  });

  test("SVG text elements have user-select: none", async ({ page }) => {
    await waitForApp(page);
    page.on("dialog", (d) => d.accept());
    await page.click("button:has-text('Samples')");
    await page.locator(".sample-item", { hasText: "Residential" }).click();

    const textEls = page.locator(".diagram-area svg text");
    const count = await textEls.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const userSelect = await textEls.nth(i).evaluate(
        (el) => getComputedStyle(el).userSelect || (getComputedStyle(el) as any).webkitUserSelect
      );
      expect(userSelect).toBe("none");
    }
  });
});
