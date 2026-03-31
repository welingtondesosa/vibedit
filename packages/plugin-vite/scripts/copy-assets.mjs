import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
mkdirSync(distDir, { recursive: true });

const assets = [
  ['../../overlay/dist/vibedit-overlay.iife.js', 'vibedit-overlay.iife.js'],
  ['../../plugin-next/src/vibedit-babel-plugin.cjs', 'vibedit-babel-plugin.cjs'],
];

for (const [src, dest] of assets) {
  const srcPath = resolve(__dirname, src);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, resolve(distDir, dest));
    console.log(`✓ ${dest} copied to dist/`);
  } else {
    console.warn(`⚠ Not found: ${src}`);
  }
}
