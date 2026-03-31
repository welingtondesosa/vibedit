import type { NextConfig } from 'next';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { VibeditServer } from '@vibedit/server';
import type { VibeditConfig } from '@vibedit/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface VibeditOptions {
  port?: number;
  undoLimit?: number;
  prettier?: boolean;
}

let serverInstance: VibeditServer | null = null;

function resolveOverlayBundle(): string | null {
  const candidates = [
    // 1. Installed as npm package — overlay is bundled alongside the plugin
    path.resolve(__dirname, 'vibedit-overlay.iife.js'),
    // 2. Monorepo development — sibling packages
    path.resolve(__dirname, '../../overlay/dist/vibedit-overlay.iife.js'),
    path.resolve(__dirname, '../../../overlay/dist/vibedit-overlay.iife.js'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function copyOverlayToPublic(cwd: string): void {
  const overlayPath = resolveOverlayBundle();
  if (!overlayPath) {
    console.warn('[Vibedit] Overlay bundle not found. Run `npm run build` in packages/overlay first.');
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
      // Start server and copy overlay only once, on the client-side compilation
      if (context.dev && !context.isServer) {
        startServer(options, context.dir ?? process.cwd());
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
