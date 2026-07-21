import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  reporter: "line",
  webServer: [
    { command: "node tests/mock-backend.mjs", port: 4100, reuseExistingServer: false },
    {
      command: "node tests/start-test-app.mjs",
      port: 3002,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:3002",
    channel: "chrome",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
