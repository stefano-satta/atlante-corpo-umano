import { defineConfig } from 'vitest/config';
import { contenuti } from './pipeline/plugin-contenuti.mjs';

export default defineConfig({
  plugins: [contenuti()],
  // '@/…' indica la cartella src, come in tsconfig.json.
  resolve: { alias: { '@': '/src' } },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'pipeline/**/*.test.mjs'],
  },
});
