import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:1430",
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "pnpm dev",
    port: 1430,
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
