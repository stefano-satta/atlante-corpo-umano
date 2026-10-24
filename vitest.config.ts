import { defineConfig } from 'vitest/config';
import { contenuti } from './pipeline/plugin-contenuti.mjs';

export default defineConfig({
  plugins: [contenuti()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'pipeline/**/*.test.mjs'],
  },
});
