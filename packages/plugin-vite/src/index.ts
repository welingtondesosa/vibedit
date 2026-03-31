import type { Plugin } from 'vite';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { VibeditServer } from '@vibedit/server';
import type { VibeditConfig } from '@vibedit/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

export interface VibeditOptions {
  port?: number;
  undoLimit?: number;
  prettier?: boolean;
}

let serverInstance: VibeditServer | null = null;

function resolveOverlayBundle(): string | null {
  const candidates = [
    // 1. Installed as npm package — bundled alongside the plugin
    path.resolve(__dirname, 'vibedit-overlay.iife.js'),
    // 2. Monorepo development
    path.resolve(__dirname, '../../overlay/dist/vibedit-overlay.iife.js'),
    path.resolve(__dirname, '../../../overlay/dist/vibedit-overlay.iife.js'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

function resolveBabelPluginPath(): string | null {
  const candidates = [
    path.resolve(__dirname, 'vibedit-babel-plugin.cjs'),
    path.resolve(__dirname, '../../plugin-next/src/vibedit-babel-plugin.cjs'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

/**
 * Returns the path to the Vibedit Babel plugin.
 * Only needed if you want to pass it manually to @vitejs/plugin-react.
 * The vibedit() plugin already handles source injection automatically.
 */
export function vibeditBabelPlugin(): string {
  const found = resolveBabelPluginPath();
  if (!found) throw new Error('[Vibedit] Babel plugin not found. Rebuild the package.');
  return found;
}

/** Find a free TCP port starting from `startPort`. */
function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findFreePort(startPort + 1));
    });
  });
}

function startServer(options: VibeditOptions & { port: number }, root: string): void {
  if (serverInstance) return;

  const config: VibeditConfig = {
    port: options.port,
    undoLimit: options.undoLimit ?? 50,
    backupDir: '.vibedit-backup',
    prettier: options.prettier ?? true,
    projectRoot: root,
  };

  serverInstance = new VibeditServer(config);
}

const OVERLAY_SCRIPT_TAG = (port: number): string =>
  `<script>window.__VIBEDIT_PORT__ = ${port};</script>
<script src="/_vibedit/overlay.js"></script>`;

export function vibedit(options: VibeditOptions = {}): Plugin[] {
  const configuredPort = options.port ?? 4242;
  let actualPort = configuredPort;
  let projectRoot: string | null = null;

  const sourcePlugin: Plugin = {
    name: 'vibedit:source',
    apply: 'serve',
    enforce: 'pre',

    transform(code, id) {
      // Only process JSX/TSX files
      if (!id.match(/\.[jt]sx$/)) return null;
      if (id.includes('node_modules')) return null;

      const babelPluginPath = resolveBabelPluginPath();
      if (!babelPluginPath) return null;

      let babel: any;
      try {
        babel = _require('@babel/core');
      } catch {
        return null;
      }

      try {
        const result = babel.transformSync(code, {
          filename: id,
          // Pass the project root so state.cwd is correct in the babel plugin
          cwd: projectRoot ?? process.cwd(),
          plugins: [babelPluginPath],
          ast: false,
          sourceMaps: true,
          configFile: false,
          babelrc: false,
          // Preserve JSX — do NOT apply preset-react, just inject attributes
          parserOpts: { plugins: ['jsx', 'typescript'] },
        });

        if (!result?.code) return null;
        return { code: result.code, map: result.map };
      } catch {
        // If babel fails, pass through unchanged
        return null;
      }
    },
  };

  const serverPlugin: Plugin = {
    name: 'vibedit',
    apply: 'serve',

    async configureServer(server) {
      projectRoot = server.config.root;
      // Find a free port — avoids conflicts when multiple Vite projects run simultaneously
      actualPort = await findFreePort(configuredPort);
      startServer({ ...options, port: actualPort }, projectRoot);

      // Serve overlay from Vite dev server
      server.middlewares.use('/_vibedit/overlay.js', (_req, res, next) => {
        const overlayPath = resolveOverlayBundle();
        if (!overlayPath) {
          next();
          return;
        }
        res.setHeader('Content-Type', 'application/javascript');
        fs.createReadStream(overlayPath).pipe(res);
      });
    },

    transformIndexHtml(html) {
      if (resolveOverlayBundle()) {
        return html.replace(
          '</body>',
          `${OVERLAY_SCRIPT_TAG(actualPort)}\n</body>`
        );
      }
      return html;
    },
  };

  return [sourcePlugin, serverPlugin];
}

export { VibeditServer };
export type { VibeditConfig };
