import type { NextConfig } from 'next';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { VibeditServer } from '@vibedit/server';
import type { VibeditConfig } from '@vibedit/server';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface VibeditOptions {
  port?: number;
  undoLimit?: number;
  prettier?: boolean;
}

let serverInstance: VibeditServer | null = null;

function resolveOverlayBundle(): string | null {
  const candidates = [
    path.resolve(__dirname, 'vibedit-overlay.iife.js'),
    path.resolve(__dirname, '../../overlay/dist/vibedit-overlay.iife.js'),
    path.resolve(__dirname, '../../../overlay/dist/vibedit-overlay.iife.js'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function resolveBabelPlugin(): string | null {
  const candidates = [
    path.resolve(__dirname, 'vibedit-babel-plugin.cjs'),
    path.resolve(__dirname, '../../overlay/dist/vibedit-babel-plugin.cjs'),
    path.resolve(__dirname, '../../../overlay/dist/vibedit-babel-plugin.cjs'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function copyOverlayToPublic(cwd: string): void {
  const overlayPath = resolveOverlayBundle();
  if (!overlayPath) {
    console.warn('[Vibedit] Overlay bundle not found.');
    return;
  }
  const destDir = path.join(cwd, 'public', '_vibedit');
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(overlayPath, path.join(destDir, 'overlay.js'));
}

function startServer(options: VibeditOptions, cwd: string): void {
  if (serverInstance) return;

  const config: VibeditConfig = {
    port: options.port ?? 4242,
    undoLimit: options.undoLimit ?? 50,
    backupDir: '.vibedit-backup',
    prettier: options.prettier ?? true,
    projectRoot: cwd,
  };

  serverInstance = new VibeditServer(config);
  copyOverlayToPublic(cwd);
}

export function withVibedit(
  nextConfig: NextConfig = {},
  options: VibeditOptions = {}
): NextConfig {
  return {
    ...nextConfig,
    webpack(config, context) {
      if (context.dev && !context.isServer) {
        startServer(options, context.dir ?? process.cwd());

        // Inject babel plugin for source-location tracking without requiring babel.config.js
        const babelPlugin = resolveBabelPlugin();
        if (babelPlugin) {
          try {
            const babelLoaderPath = require.resolve('babel-loader');
            config.module.rules.unshift({
              test: /\.[jt]sx$/,
              exclude: /node_modules/,
              enforce: 'pre' as const,
              use: [{
                loader: babelLoaderPath,
                options: {
                  plugins: [babelPlugin],
                  babelrc: false,
                  configFile: false,
                },
              }],
            });
          } catch {
            console.warn('[Vibedit] babel-loader not found — source tracking disabled. Click-to-edit may not work correctly.');
          }
        }
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, context);
      }
      return config;
    },
  };
}

export { VibeditServer };
export type { VibeditConfig };
