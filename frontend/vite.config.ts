import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    wasm(),
  ],
  resolve: {
    alias: {
      '@midnight-ntwrk/midnight-js-network-provider': path.resolve(__dirname, '../packages/midnight-js-network-provider/index.js'),
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider': path.resolve(__dirname, '../packages/midnight-js-fetch-zk-config-provider/index.js'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['@midnight-ntwrk/onchain-runtime-v3', '@midnight-ntwrk/compact-runtime'],
  },
});
