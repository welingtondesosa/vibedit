/**
 * Reads Tailwind color tokens from the project config and returns
 * a flat map of { '#hexvalue': 'token-name' } for display in the overlay.
 *
 * Supports:
 *  - Tailwind v3: tailwind.config.ts/js/mjs (theme.colors / theme.extend.colors)
 *  - Tailwind v4: CSS-based config (reads @theme block for --color-* variables)
 *  - Built-in Tailwind v3 color palette as fallback
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Built-in Tailwind v3 palette (subset — most common colors) ────────────────

const TAILWIND_PALETTE: Record<string, string> = {
  '#f8fafc': 'slate-50', '#f1f5f9': 'slate-100', '#e2e8f0': 'slate-200',
  '#cbd5e1': 'slate-300', '#94a3b8': 'slate-400', '#64748b': 'slate-500',
  '#475569': 'slate-600', '#334155': 'slate-700', '#1e293b': 'slate-800',
  '#0f172a': 'slate-900', '#020617': 'slate-950',

  '#f9fafb': 'gray-50',  '#f3f4f6': 'gray-100',  '#e5e7eb': 'gray-200',
  '#d1d5db': 'gray-300', '#9ca3af': 'gray-400',  '#6b7280': 'gray-500',
  '#4b5563': 'gray-600', '#374151': 'gray-700',  '#1f2937': 'gray-800',
  '#111827': 'gray-900', '#030712': 'gray-950',

  '#fafafa': 'zinc-50',  '#f4f4f5': 'zinc-100',  '#e4e4e7': 'zinc-200',
  '#d4d4d8': 'zinc-300', '#a1a1aa': 'zinc-400',  '#71717a': 'zinc-500',
  '#52525b': 'zinc-600', '#3f3f46': 'zinc-700',  '#27272a': 'zinc-800',
  '#18181b': 'zinc-900', '#09090b': 'zinc-950',

  '#fef2f2': 'red-50',   '#fee2e2': 'red-100',   '#fca5a5': 'red-300',
  '#f87171': 'red-400',  '#ef4444': 'red-500',   '#dc2626': 'red-600',
  '#b91c1c': 'red-700',  '#991b1b': 'red-800',   '#7f1d1d': 'red-900',

  '#fff7ed': 'orange-50', '#ffedd5': 'orange-100', '#fed7aa': 'orange-200',
  '#fb923c': 'orange-400', '#f97316': 'orange-500', '#ea580c': 'orange-600',
  '#c2410c': 'orange-700',

  '#fefce8': 'yellow-50', '#fef9c3': 'yellow-100', '#fde047': 'yellow-300',
  '#facc15': 'yellow-400', '#eab308': 'yellow-500', '#ca8a04': 'yellow-600',

  '#f0fdf4': 'green-50',  '#dcfce7': 'green-100', '#86efac': 'green-300',
  '#4ade80': 'green-400', '#22c55e': 'green-500', '#16a34a': 'green-600',
  '#15803d': 'green-700', '#166534': 'green-800',

  '#ecfdf5': 'emerald-50', '#d1fae5': 'emerald-100', '#6ee7b7': 'emerald-300',
  '#34d399': 'emerald-400', '#10b981': 'emerald-500', '#059669': 'emerald-600',

  '#eff6ff': 'blue-50',  '#dbeafe': 'blue-100',  '#93c5fd': 'blue-300',
  '#60a5fa': 'blue-400', '#3b82f6': 'blue-500',  '#2563eb': 'blue-600',
  '#1d4ed8': 'blue-700', '#1e40af': 'blue-800',

  '#eef2ff': 'indigo-50', '#e0e7ff': 'indigo-100', '#a5b4fc': 'indigo-300',
  '#818cf8': 'indigo-400', '#6366f1': 'indigo-500', '#4f46e5': 'indigo-600',
  '#4338ca': 'indigo-700', '#3730a3': 'indigo-800',

  '#f5f3ff': 'violet-50', '#ede9fe': 'violet-100', '#c4b5fd': 'violet-300',
  '#a78bfa': 'violet-400', '#8b5cf6': 'violet-500', '#7c3aed': 'violet-600',

  '#fdf4ff': 'purple-50', '#fae8ff': 'purple-100', '#d8b4fe': 'purple-300',
  '#c084fc': 'purple-400', '#a855f7': 'purple-500', '#9333ea': 'purple-600',

  '#fdf2f8': 'pink-50',  '#fce7f3': 'pink-100',  '#f9a8d4': 'pink-300',
  '#f472b6': 'pink-400', '#ec4899': 'pink-500',  '#db2777': 'pink-600',

  '#fff1f2': 'rose-50',  '#ffe4e6': 'rose-100',  '#fda4af': 'rose-300',
  '#fb7185': 'rose-400', '#f43f5e': 'rose-500',  '#e11d48': 'rose-600',

  '#ffffff': 'white',    '#000000': 'black',
  '#f0f9ff': 'sky-50',   '#e0f2fe': 'sky-100',   '#7dd3fc': 'sky-300',
  '#38bdf8': 'sky-400',  '#0ea5e9': 'sky-500',   '#0284c7': 'sky-600',

  '#ecfeff': 'cyan-50',  '#cffafe': 'cyan-100',  '#67e8f9': 'cyan-300',
  '#22d3ee': 'cyan-400', '#06b6d4': 'cyan-500',  '#0891b2': 'cyan-600',

  '#f0fdfa': 'teal-50',  '#ccfbf1': 'teal-100',  '#5eead4': 'teal-300',
  '#2dd4bf': 'teal-400', '#14b8a6': 'teal-500',  '#0d9488': 'teal-600',

  '#f7fee7': 'lime-50',  '#ecfccb': 'lime-100',  '#bef264': 'lime-300',
  '#a3e635': 'lime-400', '#84cc16': 'lime-500',  '#65a30d': 'lime-600',
};

// ── Hex normalizer ────────────────────────────────────────────────────────────

function normalizeHex(raw: string): string | null {
  const h = raw.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(h)) return h;
  if (/^#[0-9a-f]{3}$/.test(h)) {
    const [, r, g, b] = h;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

// ── Flatten nested color object { red: { 500: '#...' } } ─────────────────────

function flattenColors(
  obj: Record<string, unknown>,
  prefix = '',
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${key}` : key;
    if (typeof val === 'string') {
      const hex = normalizeHex(val);
      if (hex) out[hex] = name;
    } else if (val && typeof val === 'object') {
      flattenColors(val as Record<string, unknown>, name, out);
    }
  }
  return out;
}

// ── Tailwind v4: parse CSS @theme block ───────────────────────────────────────

function readTailwindV4(projectRoot: string): Record<string, string> | null {
  const candidates = [
    'src/app/globals.css', 'src/globals.css', 'app/globals.css',
    'styles/globals.css', 'src/styles/globals.css', 'src/index.css',
  ];
  for (const rel of candidates) {
    const p = path.join(projectRoot, rel);
    if (!fs.existsSync(p)) continue;
    const css = fs.readFileSync(p, 'utf-8');
    if (!css.includes('@theme')) continue;

    const tokens: Record<string, string> = {};
    const varRe = /--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g;
    let m: RegExpExecArray | null;
    while ((m = varRe.exec(css)) !== null) {
      const hex = normalizeHex(m[2]);
      if (hex) tokens[hex] = m[1].replace(/-(\d)/g, '-$1');
    }
    if (Object.keys(tokens).length > 0) return tokens;
  }
  return null;
}

// ── Tailwind v3: require() the config ────────────────────────────────────────

function readTailwindV3(projectRoot: string): Record<string, string> | null {
  const candidates = [
    'tailwind.config.js', 'tailwind.config.mjs', 'tailwind.config.cjs',
  ];
  for (const rel of candidates) {
    const p = path.join(projectRoot, rel);
    if (!fs.existsSync(p)) continue;
    try {
      // Dynamic require (works for CJS configs)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cfg = require(p) as { theme?: { colors?: Record<string, unknown>; extend?: { colors?: Record<string, unknown> } } };
      const colors: Record<string, unknown> = {
        ...(cfg.theme?.colors ?? {}),
        ...(cfg.theme?.extend?.colors ?? {}),
      };
      if (Object.keys(colors).length === 0) return null;
      return flattenColors(colors);
    } catch {
      // TypeScript configs or ESM — skip
    }
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns a map of { '#hexvalue': 'token-name' } for the project.
 * Falls back to the built-in Tailwind palette if no config is found.
 */
export function readTailwindTokens(projectRoot: string): Record<string, string> {
  try {
    // 1. Tailwind v4 CSS config
    const v4 = readTailwindV4(projectRoot);
    if (v4 && Object.keys(v4).length > 0) return { ...TAILWIND_PALETTE, ...v4 };

    // 2. Tailwind v3 JS config
    const v3 = readTailwindV3(projectRoot);
    if (v3 && Object.keys(v3).length > 0) return { ...TAILWIND_PALETTE, ...v3 };
  } catch {
    // Never crash the server over color tokens
  }

  // 3. Built-in palette as baseline
  return { ...TAILWIND_PALETTE };
}
