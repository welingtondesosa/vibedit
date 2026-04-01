#!/usr/bin/env node
/**
 * vibedit CLI — init command
 * Usage: npx @vibedit/next init
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();

function log(msg)   { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }
function warn(msg)  { console.log(`\x1b[33m⚠\x1b[0m ${msg}`); }
function error(msg) { console.log(`\x1b[31m✗\x1b[0m ${msg}`); }
function title(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }

// ── Detect framework ──────────────────────────────────────────────────────────

function detectFramework() {
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps.next) return 'next';
  if (deps.vite) return 'vite';
  return null;
}

function isAlreadyInstalled() {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return !!deps['@vibedit/next'];
  } catch {
    return false;
  }
}

// ── File patchers ─────────────────────────────────────────────────────────────

function patchNextConfig() {
  const candidates = ['next.config.mjs', 'next.config.js', 'next.config.ts'];
  const file = candidates.find(f => existsSync(join(cwd, f)));

  if (!file) {
    writeFileSync(join(cwd, 'next.config.mjs'), [
      "import { withVibedit } from '@vibedit/next';",
      "",
      "/** @type {import('next').NextConfig} */",
      "const nextConfig = {};",
      "",
      "export default withVibedit(nextConfig);",
    ].join('\n'));
    log('next.config.mjs created with withVibedit');
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');
  if (content.includes('withVibedit')) {
    warn(`${file} already has withVibedit — skipping`);
    return;
  }

  const isEsm = file.endsWith('.mjs') || content.includes('export default');
  const importLine = isEsm
    ? "import { withVibedit } from '@vibedit/next';"
    : "const { withVibedit } = require('@vibedit/next');";

  // Prepend import line
  content = importLine + '\n' + content;

  // Wrap export default someVar  →  export default withVibedit(someVar)
  content = content.replace(
    /export default\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*;?(\s*)$/m,
    'export default withVibedit($1);$2'
  );
  // Wrap inline object: export default { ... }  →  export default withVibedit({ ... })
  content = content.replace(
    /export default\s*(\{[\s\S]*?\})\s*;?(\s*)$/m,
    'export default withVibedit($1);$2'
  );
  // CJS: module.exports = x  →  module.exports = withVibedit(x)
  content = content.replace(
    /module\.exports\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*;?/,
    'module.exports = withVibedit($1);'
  );

  writeFileSync(join(cwd, file), content);
  log(`${file} updated with withVibedit`);
}

function patchLayout() {
  const candidates = [
    'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx',
  ];
  const file = candidates.find(f => existsSync(join(cwd, f)));

  if (!file) {
    warn('app/layout.tsx not found — add the Vibedit script manually:');
    printLayoutSnippet();
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');

  if (content.includes('_vibedit')) {
    warn(`${file} already has the Vibedit script — skipping`);
    return;
  }

  // Add Script import if not present
  if (!content.includes("from 'next/script'")) {
    content = content.replace(
      /^(import )/m,
      "import Script from 'next/script';\n$1"
    );
  }

  // Add suppressHydrationWarning to <body if not present
  content = content.replace(
    /<body([^>]*)>/,
    (match, attrs) => {
      if (attrs.includes('suppressHydrationWarning')) return match;
      return `<body${attrs} suppressHydrationWarning>`;
    }
  );

  // Inject Script before </body>
  const scriptSnippet =
    `      {process.env.NODE_ENV === 'development' && (\n` +
    `        <Script src="/_vibedit/overlay.js" strategy="beforeInteractive" />\n` +
    `      )}`;

  content = content.replace('</body>', `${scriptSnippet}\n      </body>`);
  writeFileSync(join(cwd, file), content);
  log(`${file} updated with Vibedit script`);
}

function printLayoutSnippet() {
  console.log(`
  Add this inside <body> in your layout.tsx:

  import Script from 'next/script';

  {process.env.NODE_ENV === 'development' && (
    <Script src="/_vibedit/overlay.js" strategy="beforeInteractive" />
  )}
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'init') {
  title('Vibedit — setting up your Next.js project...\n');

  // 1. Detect framework
  let framework;
  try {
    framework = detectFramework();
  } catch {
    error('No package.json found. Run this command from the root of your project.');
    process.exit(1);
  }

  if (framework !== 'next') {
    error('Next.js not detected. For Vite projects, use @vibedit/vite instead.');
    process.exit(1);
  }

  log('Framework detected: Next.js');

  // 2. Install package (skip if already in package.json)
  if (isAlreadyInstalled()) {
    log('@vibedit/next is already installed');
  } else {
    title('Installing @vibedit/next...');
    try {
      execSync('npm install --save-dev @vibedit/next', { stdio: 'inherit', cwd });
    } catch {
      error('Failed to install package. Check your internet connection and try again.');
      process.exit(1);
    }
  }

  // 3. Patch config files
  title('Updating project files...');
  patchNextConfig();
  patchLayout();

  // 4. Done
  console.log(`
\x1b[1m\x1b[32m✓ Vibedit is ready!\x1b[0m

Next steps:
  1. Restart your dev server: \x1b[1mnpm run dev\x1b[0m
  2. Open your app in the browser
  3. Look for the blue Vibedit button in the \x1b[1mbottom-right corner\x1b[0m

Questions or issues → https://github.com/welingtondesosa/vibedit/issues
`);

} else {
  console.log(`
\x1b[1mVibedit CLI\x1b[0m

Usage:
  \x1b[1mnpx @vibedit/next init\x1b[0m    Set up Vibedit in the current project

Docs: https://github.com/welingtondesosa/vibedit
`);
}
