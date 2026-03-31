import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    // Replace process.env.NODE_ENV in the IIFE bundle — process doesn't exist in browsers
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.tsx'),
      name: 'Vibedit',
      fileName: 'vibedit-overlay',
      formats: ['iife'],
    },
    rollupOptions: {
      // Bundle React with the overlay — it runs in its own Shadow DOM
      external: [],
    },
    minify: 'esbuild',
    reportCompressedSize: true,
    target: 'es2020',
  },
});
