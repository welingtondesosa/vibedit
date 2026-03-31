/**
 * Copies the overlay IIFE bundle and the Babel plugin into dist/
 * so the package is self-contained when installed via npm.
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
mkdirSync(distDir, { recursive: true });

// 1. Overlay IIFE bundle
const overlaySrc = resolve(__dirname, '../../overlay/dist/vibedit-overlay.iife.js');
if (existsSync(overlaySrc)) {
  copyFileSync(overlaySrc, resolve(distDir, 'vibedit-overlay.iife.js'));
  console.log('✓ vibedit-overlay.iife.js copied to dist/');
} else {
  console.warn('⚠ Overlay bundle not found — run npm run build in packages/overlay first');
}

// 2. Babel plugin (CommonJS, must ship as-is)
const babelSrc = resolve(__dirname, '../src/vibedit-babel-plugin.cjs');
if (existsSync(babelSrc)) {
  copyFileSync(babelSrc, resolve(distDir, 'vibedit-babel-plugin.cjs'));
  console.log('✓ vibedit-babel-plugin.cjs copied to dist/');
} else {
  console.warn('⚠ Babel plugin not found at src/vibedit-babel-plugin.cjs');
}
