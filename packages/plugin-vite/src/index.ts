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

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
const SKIP_TAGS = new Set(['script', 'style']);

/**
 * Inject data-vibedit-* attributes into a served HTML string.
 * Reads the original file from disk to get correct line/col numbers,
 * because Vite prepends <script src="/@vite/client"> which shifts line numbers.
 */
function injectHtmlSourceAttrs(servedHtml: string, filePath: string): string {
  let originalHtml: string;
  try {
    originalHtml = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return servedHtml;
  }

  // Build line-offset table for the original file
  const lineOffsets: number[] = [0];
  for (let i = 0; i < originalHtml.length; i++) {
    if (originalHtml[i] === '\n') lineOffsets.push(i + 1);
  }

  function getLineCol(offset: number): { line: number; col: number } {
    let lo = 0, hi = lineOffsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineOffsets[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return { line: lo + 1, col: offset - lineOffsets[lo] + 1 };
  }

  // Collect {line, col} for each non-void, non-skip tag in the ORIGINAL html (in order)
  const TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?(\/?>)/g;
  const positions: Array<{ line: number; col: number }> = [];
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(originalHtml)) !== null) {
    const tag = m[1].toLowerCase();
    if (VOID_TAGS.has(tag) || SKIP_TAGS.has(tag)) continue;
    positions.push(getLineCol(m.index));
  }

  // Walk served HTML in the same order and inject attributes
  let posIdx = 0;
  const SERVED_RE = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?(\/?>)/g;
  return servedHtml.replace(SERVED_RE, (full, tagName, attrs, close) => {
    const tag = tagName.toLowerCase();
    if (VOID_TAGS.has(tag) || SKIP_TAGS.has(tag)) return full;
    const pos = positions[posIdx++];
    if (!pos) return full;
    const dataAttrs = ` data-vibedit-file="${filePath}" data-vibedit-line="${pos.line}" data-vibedit-col="${pos.col}"`;
    return `<${tagName}${attrs ?? ''}${dataAttrs}${close}`;
  });
}

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

    transformIndexHtml(html, ctx) {
      // Inject source-location attributes so plain HTML projects get click-to-edit
      let filePath: string = (ctx as any)?.filename ?? '';
      if (!filePath && (ctx as any)?.path && projectRoot) {
        filePath = path.join(projectRoot, (ctx as any).path);
      }
      if (filePath && !filePath.includes('node_modules')) {
        html = injectHtmlSourceAttrs(html, filePath);
      }

      if (resolveOverlayBundle()) {
        return html.replace('</body>', `${OVERLAY_SCRIPT_TAG(actualPort)}\n</body>`);
      }
      return html;
    },
  };

  return [sourcePlugin, serverPlugin];
}

export { VibeditServer };
export type { VibeditConfig };
