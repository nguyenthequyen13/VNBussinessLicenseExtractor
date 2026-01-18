import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for libraries that might expect it, but don't inject API_KEY
      'process.env': {},
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
          content: resolve(__dirname, 'content.js'),
        },
        output: {
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