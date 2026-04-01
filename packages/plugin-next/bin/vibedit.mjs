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
    log('next.config.mjs criado com withVibedit');
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');
  if (content.includes('withVibedit')) {
    warn(`${file} já tem withVibedit — pulando`);
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
  log(`${file} atualizado com withVibedit`);
}

function patchLayout() {
  const candidates = [
    'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx',
  ];
  const file = candidates.find(f => existsSync(join(cwd, f)));

  if (!file) {
    warn('Arquivo app/layout.tsx não encontrado — adicione manualmente o Script do Vibedit:');
    printLayoutSnippet();
    return;
  }

  let content = readFileSync(join(cwd, file), 'utf8');

  if (content.includes('_vibedit')) {
    warn(`${file} já tem o script do Vibedit — pulando`);
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
  log(`${file} atualizado com o script do Vibedit`);
}

function printLayoutSnippet() {
  console.log(`
  Adicione isto dentro do <body> no seu layout.tsx:

  import Script from 'next/script';

  {process.env.NODE_ENV === 'development' && (
    <Script src="/_vibedit/overlay.js" strategy="beforeInteractive" />
  )}
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const command = process.argv[2];

if (command === 'init') {
  title('Vibedit — configurando seu projeto Next.js...\n');

  // 1. Detect framework
  let framework;
  try {
    framework = detectFramework();
  } catch {
    error('package.json não encontrado. Execute o comando na raiz do seu projeto.');
    process.exit(1);
  }

  if (framework !== 'next') {
    error('Next.js não detectado. Para projetos Vite, use @vibedit/vite.');
    process.exit(1);
  }

  log('Framework detectado: Next.js');

  // 2. Install package (skip if already in package.json)
  if (isAlreadyInstalled()) {
    log('@vibedit/next já está instalado');
  } else {
    title('Instalando @vibedit/next...');
    try {
      execSync('npm install --save-dev @vibedit/next', { stdio: 'inherit', cwd });
    } catch {
      error('Erro ao instalar o pacote. Verifique sua conexão com a internet.');
      process.exit(1);
    }
  }

  // 3. Patch config files
  title('Configurando arquivos...');
  patchNextConfig();
  patchLayout();

  // 4. Done
  console.log(`
\x1b[1m\x1b[32m✓ Vibedit instalado com sucesso!\x1b[0m

Para começar:
  1. Reinicie o servidor: \x1b[1mnpm run dev\x1b[0m
  2. Abra o app no navegador
  3. Procure o botão azul no \x1b[1mcanto inferior direito\x1b[0m

Dúvidas ou problemas → https://github.com/welingtondesosa/vibedit/issues
`);

} else {
  console.log(`
\x1b[1mVibedit CLI\x1b[0m

Uso:
  \x1b[1mnpx @vibedit/next init\x1b[0m    Configura o Vibedit no projeto atual

Documentação: https://github.com/welingtondesosa/vibedit
`);
}
