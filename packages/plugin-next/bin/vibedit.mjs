#!/usr/bin/env node
/**
 * vibedit CLI — init command
 * Usage: npx vibedit init
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

// ── File patchers ─────────────────────────────────────────────────────────────

function patchNextConfig() {
  const candidates = ['next.config.mjs', 'next.config.js', 'next.config.ts'];
  const file = candidates.find(f => existsSync(join(cwd, f)));

  if (!file) {
    // Create minimal config
    writeFileSync(join(cwd, 'next.config.mjs'), [
      "import { withVibedit } from '@vibedit/plugin-next';",
      "export default withVibedit({});",
    ].join('\n'));
    log('Creado next.config.mjs con withVibedit');
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');
  if (content.includes('withVibedit')) {
    warn(`${file} ya tiene withVibedit — omitido`);
    return;
  }

  // Prepend import and wrap export default
  const isEsm = file.endsWith('.mjs') || content.includes('export default');
  const importLine = isEsm
    ? "import { withVibedit } from '@vibedit/plugin-next';"
    : "const { withVibedit } = require('@vibedit/plugin-next');";

  content = content
    .replace(/^(import|const)/, `${importLine}\n$1`)
    .replace(/export default\s+(\w+)/, 'export default withVibedit($1)')
    .replace(/module\.exports\s*=\s*(\w+)/, 'module.exports = withVibedit($1)');

  writeFileSync(join(cwd, file), content);
  log(`${file} actualizado con withVibedit`);
}

function createBabelConfig() {
  const babelFile = join(cwd, 'babel.config.js');
  if (existsSync(babelFile)) {
    warn('babel.config.js ya existe — verificá que incluya el plugin de Vibedit');
    return;
  }
  writeFileSync(babelFile, [
    "/** @type {import('@babel/core').TransformOptions} */",
    "module.exports = {",
    "  presets: ['next/babel'],",
    "  plugins: [",
    "    process.env.NODE_ENV === 'development'",
    "      ? require.resolve('@vibedit/plugin-next/dist/vibedit-babel-plugin.cjs')",
    "      : null,",
    "  ].filter(Boolean),",
    "};",
  ].join('\n'));
  log('babel.config.js creado');
}

function patchLayout() {
  const candidates = [
    'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx',
  ];
  const file = candidates.find(f => existsSync(join(cwd, f)));
  if (!file) {
    warn('No se encontró app/layout.tsx — agregá manualmente el Script de Vibedit');
    printLayoutSnippet();
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');
  if (content.includes('_vibedit')) {
    warn(`${file} ya tiene el script de Vibedit — omitido`);
    return;
  }

  // Add Script import if not present
  if (!content.includes("from 'next/script'")) {
    content = content.replace(
      /^(import )/m,
      "import Script from 'next/script';\n$1"
    );
  }

  // Inject scripts before </body>
  const scriptSnippet = `
      {process.env.NODE_ENV === 'development' && (
        <>
          <Script id="vibedit-port" strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: 'window.__VIBEDIT_PORT__ = 4242;' }} />
          <Script src="/_vibedit/overlay.js" strategy="afterInteractive" />
        </>
      )}`;

  content = content.replace('</body>', `${scriptSnippet}\n      </body>`);
  writeFileSync(join(cwd, file), content);
  log(`${file} actualizado con los scripts de Vibedit`);
}

function printLayoutSnippet() {
  console.log(`
  Agregá esto dentro del <body> en tu layout:

  import Script from 'next/script';

  {process.env.NODE_ENV === 'development' && (
    <>
      <Script id="vibedit-port" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: 'window.__VIBEDIT_PORT__ = 4242;' }} />
      <Script src="/_vibedit/overlay.js" strategy="afterInteractive" />
    </>
  )}
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'init') {
  title('Vibedit — configurando tu proyecto...\n');

  // 1. Detect framework
  let framework;
  try {
    framework = detectFramework();
  } catch {
    error('No se encontró package.json. Ejecutá el comando desde la raíz de tu proyecto.');
    process.exit(1);
  }

  if (!framework) {
    error('No se detectó Next.js ni Vite. Vibedit requiere uno de los dos.');
    process.exit(1);
  }

  log(`Framework detectado: ${framework}`);

  // 2. Install packages
  title('Instalando paquetes...');
  try {
    execSync('npm install @vibedit/server @vibedit/plugin-next @babel/runtime --save-dev', {
      stdio: 'inherit', cwd
    });
  } catch {
    error('Error al instalar paquetes. Verificá tu conexión a internet.');
    process.exit(1);
  }

  // 3. Patch config files
  title('Configurando archivos...');
  if (framework === 'next') {
    patchNextConfig();
    createBabelConfig();
    patchLayout();
  }

  // 4. Done
  console.log(`
\x1b[1m\x1b[32m¡Vibedit instalado correctamente!\x1b[0m

Para empezar:
  1. Ejecutá \x1b[1mnpx next dev\x1b[0m
  2. Abrí tu proyecto en el navegador
  3. Presioná \x1b[1mCtrl + Shift + E\x1b[0m para activar el editor

¿Preguntas? → https://github.com/tu-usuario/vibedit
`);

} else {
  console.log(`
\x1b[1mVibedit CLI\x1b[0m

Comandos disponibles:
  \x1b[1minit\x1b[0m    Configura Vibedit en el proyecto actual

Uso:
  npx vibedit init
`);
}
