import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // shims adds import.meta.url polyfill in the CJS build
  shims: true,
  external: ['vite', '@vibedit/server'],
});
