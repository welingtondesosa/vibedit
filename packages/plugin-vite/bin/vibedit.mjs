#!/usr/bin/env node
/**
 * vibedit CLI for Vite — init command
 * Usage: npx @vibedit/vite init
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();

function log(msg)   { console.log(`\x1b[32m✓\x1b[0m ${msg}`); }
function warn(msg)  { console.log(`\x1b[33m⚠\x1b[0m ${msg}`); }
function error(msg) { console.log(`\x1b[31m✗\x1b[0m ${msg}`); }
function title(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }

function detectFramework() {
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (deps.vite) return 'vite';
  if (deps.next) return 'next';
  return null;
}

function isAlreadyInstalled() {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return !!deps['@vibedit/vite'];
  } catch {
    return false;
  }
}

// ── Patch vite.config ─────────────────────────────────────────────────────────

function patchViteConfig() {
  const candidates = [
    'vite.config.ts', 'vite.config.js',
    'vite.config.dev.ts', 'vite.config.dev.js',
  ];

  // Prefer dev-specific config if it exists
  const devConfig = ['vite.config.dev.ts', 'vite.config.dev.js'].find(f => existsSync(join(cwd, f)));
  const mainConfig = ['vite.config.ts', 'vite.config.js'].find(f => existsSync(join(cwd, f)));
  const file = devConfig || mainConfig;

  if (!file) {
    // Create a new dev config alongside the main one (safe for Cloudflare/production deploys)
    writeFileSync(join(cwd, 'vite.config.dev.ts'), [
      "import { defineConfig } from 'vite';",
      "import react from '@vitejs/plugin-react';",
      "import { vibedit } from '@vibedit/vite';",
      "",
      "export default defineConfig({",
      "  plugins: [react(), vibedit()],",
      "});",
    ].join('\n'));
    log('vite.config.dev.ts created with vibedit plugin');
    patchDevScript('vite.config.dev.ts');
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');

  if (content.includes('@vibedit/vite')) {
    warn(`${file} already has vibedit — skipping`);
    return;
  }

  // Add import
  content = content.replace(
    /^(import)/m,
    "import { vibedit } from '@vibedit/vite';\n$1"
  );

  // Add vibedit() to plugins array
  content = content.replace(
    /plugins:\s*\[([^\]]*)\]/,
    (match, inner) => `plugins: [${inner.trimEnd()}, vibedit()]`
  );

  writeFileSync(join(cwd, file), content);
  log(`${file} updated with vibedit plugin`);
}

function patchDevScript(configFile) {
  const pkgPath = join(cwd, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  if (!pkg.scripts) return;

  const devScript = pkg.scripts.dev ?? '';
  if (devScript.includes(configFile)) {
    warn(`package.json dev script already uses ${configFile} — skipping`);
    return;
  }

  // Update dev script to use the dev config
  pkg.scripts.dev = `vite --config ${configFile}`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  log(`package.json dev script updated to use ${configFile}`);
}

// ── Create vibedit-responsive.css and inject import ───────────────────────────

function ensureResponsiveCss() {
  const srcDir = existsSync(join(cwd, 'src')) ? join(cwd, 'src') : cwd;
  const cssFile = join(srcDir, 'vibedit-responsive.css');

  if (!existsSync(cssFile)) {
    writeFileSync(cssFile, '/* Vibedit responsive overrides — generated automatically */\n');
    log('src/vibedit-responsive.css created');
  } else {
    warn('src/vibedit-responsive.css already exists — skipping');
    return;
  }

  // Add import to entry point
  const entryPoints = [
    'src/main.tsx', 'src/main.ts', 'src/main.jsx', 'src/main.js',
    'src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js',
  ];
  const entry = entryPoints.find(f => existsSync(join(cwd, f)));
  if (!entry) {
    warn('Entry point not found — add this manually to your entry file:');
    console.log("  import './vibedit-responsive.css';");
    return;
  }

  const content = readFileSync(join(cwd, entry), 'utf8');
  if (!content.includes('vibedit-responsive.css')) {
    writeFileSync(join(cwd, entry), `import './vibedit-responsive.css';\n` + content);
    log(`${entry} updated with vibedit-responsive.css import`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'init') {
  title('Vibedit — setting up your Vite project...\n');

  // 1. Detect framework
  let framework;
  try {
    framework = detectFramework();
  } catch {
    error('No package.json found. Run this command from the root of your project.');
    process.exit(1);
  }

  if (framework !== 'vite') {
    error('Vite not detected. For Next.js projects, use @vibedit/next instead.');
    process.exit(1);
  }

  log('Framework detected: Vite');

  // 2. Install package
  if (isAlreadyInstalled()) {
    log('@vibedit/vite is already installed');
  } else {
    title('Installing @vibedit/vite...');
    try {
      execSync('npm install --save-dev @vibedit/vite', { stdio: 'inherit', cwd });
    } catch {
      error('Failed to install package. Check your internet connection and try again.');
      process.exit(1);
    }
  }

  // 3. Patch config and create CSS file
  title('Updating project files...');
  patchViteConfig();
  ensureResponsiveCss();

  // 4. Done
  console.log(`
\x1b[1m\x1b[32m✓ Vibedit is ready!\x1b[0m

Next steps:
  1. Start your dev server: \x1b[1mnpm run dev\x1b[0m
  2. Open your app in the browser
  3. Look for the blue Vibedit button in the \x1b[1mbottom-right corner\x1b[0m

Questions or issues → https://github.com/welingtondesosa/vibedit/issues
`);

} else {
  console.log(`
\x1b[1mVibedit CLI\x1b[0m

Usage:
  \x1b[1mnpx @vibedit/vite init\x1b[0m    Set up Vibedit in the current project

Docs: https://github.com/welingtondesosa/vibedit
`);
}
