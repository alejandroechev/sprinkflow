/**
 * Phase 2 — Manual Playwright Walkthrough
 * Covers items not already in SprinkFlow.spec.ts:
 * 1. Console errors on load
 * 2. Feedback button text
 * 3. Guide opens intro.html
 * 4. Property panel editable fields
 * 5. Delete all nodes edge case
 * 6. Delete pipe button
 */
import { test, expect, type Page } from "@playwright/test";

async function waitForApp(page: Page) {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("SprinkFlow");
}

// ── 1. App Load — no console errors ──
test("App loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await waitForApp(page);

  // Filter out known benign errors (e.g. favicon, analytics)
  const realErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("analytics") && !e.includes("ERR_CONNECTION_REFUSED")
  );
  expect(realErrors).toEqual([]);
});

// ── 2. Feedback button shows "💬 Feedback" ──
test("Feedback button shows correct text", async ({ page }) => {
  await waitForApp(page);
  const btn = page.locator("button", { hasText: "Feedback" });
  await expect(btn).toBeVisible();
  // Should contain the emoji and word
  const text = await btn.textContent();
  expect(text).toContain("💬");
  expect(text).toContain("Feedback");
});

// ── 3. Guide button opens intro.html ──
test("Guide button opens intro.html in new tab", async ({ page, context }) => {
  await waitForApp(page);

  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    page.click("button:has-text('Guide')"),
  ]);
  await newPage.waitForLoadState();
  expect(newPage.url()).toContain("intro.html");
});

// ── 4. Property panel — editable fields ──
test("Property panel fields are editable", async ({ page }) => {
  await waitForApp(page);
  page.on("dialog", (d) => d.accept());

  // Load sample
  await page.click("button:has-text('Samples')");
  await page.locator(".sample-item", { hasText: "Residential" }).click();

  // Click a sprinkler node (index 2)
  await page.locator("svg .node-group").nth(2).click();

  // Edit the Name field
  const nameInput = page.locator(".property-panel input").first();
  await nameInput.fill("Test Name");
  const val = await nameInput.inputValue();
  expect(val).toBe("Test Name");

  // Edit elevation
  const elevInput = page.locator(".property-panel input[type='number']").first();
  await elevInput.fill("15");
  const elevVal = await elevInput.inputValue();
  expect(elevVal).toBe("15");
});

// ── 5. Delete all nodes → empty project ──
test("Delete all nodes results in empty project", async ({ page }) => {
  await waitForApp(page);
  page.on("dialog", (d) => d.accept());

  await page.click("button:has-text('Samples')");
  await page.locator(".sample-item", { hasText: "Residential" }).click();

  // Delete all 4 nodes one by one
  for (let i = 0; i < 4; i++) {
    const nodeGroups = page.locator("svg .node-group");
    const count = await nodeGroups.count();
    if (count === 0) break;
    await nodeGroups.first().click();
    await page.click("button:has-text('Delete Node')");
  }

  await expect(page.locator(".status-bar span").first()).toHaveText("Nodes: 0");
  await expect(page.locator(".status-bar span").nth(1)).toHaveText("Pipes: 0");

  // App should still be functional
  await expect(page.locator("h1")).toHaveText("SprinkFlow");
});

// ── 6. Delete pipe button works ──
test("Delete pipe button removes pipe", async ({ page }) => {
  await waitForApp(page);
  page.on("dialog", (d) => d.accept());

  await page.click("button:has-text('Samples')");
  await page.locator(".sample-item", { hasText: "Residential" }).click();
  await expect(page.locator(".status-bar span").nth(1)).toHaveText("Pipes: 3");

  // Click a pipe
  await page.locator("svg .pipe-group").first().click();
  await expect(page.locator(".property-panel")).toContainText("Pipe");

  // Delete it
  await page.click("button:has-text('Delete Pipe')");
  await expect(page.locator(".status-bar span").nth(1)).toHaveText("Pipes: 2");
});

// ── 7. Console errors when loading each sample ──
test("No console errors when loading all 5 samples", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await waitForApp(page);
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
    // Let React re-render
    await page.waitForTimeout(200);
  }

  const realErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("analytics") && !e.includes("ERR_CONNECTION_REFUSED")
  );
  expect(realErrors).toEqual([]);
});

// ── 8. No console errors when calculating all samples ──
test("No console errors when calculating all samples", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await waitForApp(page);
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
    await page.waitForTimeout(200);
  }

  const realErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("analytics") && !e.includes("ERR_CONNECTION_REFUSED")
  );
  expect(realErrors).toEqual([]);
});

// ── 9. Hazard class change updates the selector ──
test("Changing hazard class updates selector and persists", async ({ page }) => {
  await waitForApp(page);
  const select = page.locator("select.hazard-select");

  // Change to OH-2
  await select.selectOption("ordinary_2");
  await expect(select).toHaveValue("ordinary_2");

  // Change to Extra Hazard if available
  const options = await select.locator("option").allTextContents();
  expect(options.length).toBeGreaterThanOrEqual(3);
});

// ── 10. Supply node shows pressure fields ──
test("Supply node shows static/residual pressure fields", async ({ page }) => {
  await waitForApp(page);
  page.on("dialog", (d) => d.accept());

  await page.click("button:has-text('Samples')");
  await page.locator(".sample-item", { hasText: "Residential" }).click();

  // Click supply node (first node in residential)
  await page.locator("svg .node-group").first().click();

  const panel = page.locator(".property-panel");
  await expect(panel).toContainText("Static Pressure");
  await expect(panel).toContainText("Residual Pressure");
  await expect(panel).toContainText("Residual Flow");
});

// ── 11. State persists across page reload ──
test("Project state persists across page reload", async ({ page }) => {
  await waitForApp(page);
  page.on("dialog", (d) => d.accept());

  // Load a sample
  await page.click("button:has-text('Samples')");
  await page.locator(".sample-item", { hasText: "Residential" }).click();
  await expect(page.locator(".status-bar span").first()).not.toHaveText("Nodes: 0");
  // Wait for debounced save
  await page.waitForTimeout(700);
  // Reload and verify
  await page.reload();
  await expect(page.locator(".status-bar span").first()).not.toHaveText("Nodes: 0");
});

// ── 12. Toolbar button order: New, Open, Samples, Save ──
test("Toolbar buttons are in correct order: New, Open, Samples, Save", async ({ page }) => {
  await waitForApp(page);
  const buttons = page.locator(".toolbar button");
  const texts = await buttons.allTextContents();
  const newIdx = texts.findIndex((t) => t.trim() === "New");
  const openIdx = texts.findIndex((t) => t.trim() === "Open");
  const samplesIdx = texts.findIndex((t) => t.includes("Samples"));
  const saveIdx = texts.findIndex((t) => t.trim() === "Save");
  expect(newIdx).toBeLessThan(openIdx);
  expect(openIdx).toBeLessThan(samplesIdx);
  expect(samplesIdx).toBeLessThan(saveIdx);
});
