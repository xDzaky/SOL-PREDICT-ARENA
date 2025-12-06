import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "4173";
const HOST = process.env.HOST ?? "127.0.0.1";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: process.env.CI ? "on" : "retain-on-failure",
    video: process.env.CI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    viewport: { width: 1280, height: 720 },
  },
  fullyParallel: true,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: `cross-env VITE_E2E_TEST=true pnpm dev --host ${HOST} --port ${PORT}`,
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 90_000,
  },
});
