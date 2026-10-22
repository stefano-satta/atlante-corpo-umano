import { defineConfig, devices } from '@playwright/test';

// Test end-to-end sulla build di produzione. La grafica 3D gira su SwiftShader (WebGL via CPU).
export default defineConfig({
  testDir: 'test/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4192',
    locale: 'it-IT',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4192 --strictPort',
    url: 'http://localhost:4192',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
