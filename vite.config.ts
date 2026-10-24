import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { contenuti } from './pipeline/plugin-contenuti.mjs';

export default defineConfig({
  plugins: [react(), contenuti()],
});
