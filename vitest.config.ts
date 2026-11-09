import { defineConfig } from 'vitest/config';
import { contenuti } from './pipeline/plugin-contenuti.mjs';

export default defineConfig({
  plugins: [contenuti()],
  // '@/…' indica la cartella src, come in tsconfig.json.
  resolve: { alias: { '@': '/src' } },
  test: {
    // Tutti i test stanno in test/: unit/ ricalca src/, pipeline/ la cartella omonima; e2e/ è di Playwright.
    include: ['test/unit/**/*.test.{ts,tsx}', 'test/pipeline/**/*.test.mjs'],
  },
});
