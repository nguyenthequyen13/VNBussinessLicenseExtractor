import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Define environment variables to be replaced in the code
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          // Entry point 1: The Popup HTML
          popup: resolve(__dirname, 'index.html'),
          // Entry point 2: The Content Script (must be separate)
          content: resolve(__dirname, 'content.js'),
        },
        output: {
          // Ensure content.js keeps its name (no hash) so manifest.json can find it
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'content') {
              return 'content.js';
            }
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
  };
});