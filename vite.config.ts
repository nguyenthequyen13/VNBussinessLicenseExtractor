import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Ensure we have a valid key string to prevent runtime crashes
  // If env.API_KEY is missing, use a placeholder or check your .env file
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for libraries that might expect it
      'process.env': {},
      // Replace specific env variable
      'process.env.API_KEY': JSON.stringify(apiKey),
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