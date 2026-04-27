# Vibedit

> Visual editing overlay for React apps — click any element, edit its styles and text, watch your source files update live. Now with local AI powered by Ollama.

**100% local. No cloud. No accounts. Free AI via Ollama.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fnext?color=%236366f1&label=%40vibedit%2Fnext)](https://www.npmjs.com/package/@vibedit/next)
[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fvite?color=%236366f1&label=%40vibedit%2Fvite)](https://www.npmjs.com/package/@vibedit/vite)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## What is Vibedit?

Vibedit injects a non-intrusive editing overlay into your React app during development. Activate it with the floating button, click any element, and a panel appears showing all its editable CSS properties. Changes are written directly to your source files using AST parsing (ts-morph) — not regex, not string replacement. Reload the page and your changes are still there.

Works with **Next.js**, **Vite**, plain HTML, and any React-based framework.

---

## Quick Start

### Next.js

One command sets everything up automatically:

```bash
npx @vibedit/next init
```

This installs the package, patches your `next.config.mjs`, and injects the overlay script into `app/layout.tsx`. Then restart your dev server and look for the Vibedit button in the bottom-right corner.

**Manual setup:** see the [@vibedit/next README](packages/plugin-next/README.md).

---

### Vite

One command sets everything up automatically:

```bash
npx @vibedit/vite init
```

This installs the package and adds the `vibedit()` plugin to your `vite.config.ts`. Then run `npm run dev` and look for the Vibedit button in the bottom-right corner.

**Manual setup:** see the [@vibedit/vite README](packages/plugin-vite/README.md).

---

## How it works

1. **Source tracking** — A Babel plugin injects `data-vibedit-file` and `data-vibedit-line` attributes on every native HTML element at compile time. This tells Vibedit exactly which file and line each element came from.

2. **Overlay** — A React app bundled as an IIFE mounts inside a Shadow DOM host, so its styles never affect your app. The overlay connects to the Vibedit server via WebSocket.

3. **Server** — A local Node.js server (port 4242) receives edit messages and writes changes back to source files using [ts-morph](https://ts-morph.com/) AST manipulation. Supports inline styles, text content, i18n translation files, plain HTML, and breakpoint-specific CSS via generated `vibedit-responsive.css`.

4. **Zero production impact** — The plugin uses `apply: 'serve'` (Vite) or `NODE_ENV === 'development'` (Next.js) to ensure nothing is injected into production builds.

---

## What you can edit

| Feature | Status |
|---|---|
| Inline style properties (color, spacing, typography, etc.) | ✅ |
| Text content (direct JSX text) | ✅ |
| Text from props / i18n translation files | ✅ |
| Breakpoint-specific CSS (Mobile / Desktop) | ✅ |
| Plain HTML projects (no JSX required) | ✅ |
| Undo history (Ctrl+Z in browser) | ✅ |
| Element reordering (drag & drop) | ✅ |
| AI-powered suggestions via Ollama (local, free) | ✅ |
| Copy as code (CSS / Tailwind / React inline) | ✅ |
| Box model visualizer | ✅ |
| Color history (last 8 colors, persisted) | ✅ |
| WCAG contrast checker | ✅ |
| Tailwind token display | ✅ |
| Tailwind class writing | 🔜 planned |
| CSS Modules | 🔜 planned |

---

## AI Assistant (Ollama)

Vibedit includes a built-in AI assistant that runs **100% locally** using [Ollama](https://ollama.com). No cloud, no API keys, no cost per request.

### Setup

```bash
# 1. Install Ollama (one time)
# Download from https://ollama.com

# 2. Pull a model
ollama pull llama3
```

### Usage

1. Select any element with Vibedit
2. At the top of the edit panel, find the ✨ field
3. Type a natural language instruction:
   - `"make it more modern"`
   - `"add shadow and round the corners"`
   - `"increase contrast and make text bigger"`
4. Click **Ask** — the AI returns CSS suggestions
5. Apply them individually (✓) or all at once (**Apply all**)

Every applied suggestion goes through the same pipeline as manual edits — written to your source files via AST.

> **No Ollama?** The panel shows a link to install it. Vibedit works perfectly without AI — it's an optional power feature.

---

## Packages

| Package | Description |
|---|---|
| [`@vibedit/next`](packages/plugin-next) | Next.js plugin |
| [`@vibedit/vite`](packages/plugin-vite) | Vite plugin |
| [`@vibedit/server`](packages/server) | WebSocket server + AST file writer |
| [`@vibedit/overlay`](packages/overlay) | React overlay UI (IIFE bundle, Shadow DOM) |

---

## Options

Both plugins accept the same options object:

```ts
vibedit({
  port: 4242,        // WebSocket server port (default: 4242)
  undoLimit: 50,     // Max undo steps (default: 50)
  prettier: true,    // Format files with Prettier after writing (default: true)
})
```

---

## Monorepo development

```bash
git clone https://github.com/welingtondesosa/vibedit
cd vibedit
npm install
npm run build      # build all packages

# Run the Next.js demo
cd apps/demo-next && npm run dev

# Run the Vite demo / landing page
cd apps/demo-vite && npm run dev
```

---

## Contributing

Issues and PRs are welcome. The codebase is TypeScript throughout. Before submitting a PR:

```bash
npm run build      # must pass
```

Key files to know:
- `packages/server/src/astHelpers.ts` — all AST read/write logic
- `packages/overlay/src/` — the editor UI
- `packages/plugin-vite/src/index.ts` — Vite plugin + transform hook

---

## License

MIT License — Copyright (c) 2026 Welington de Sosa - INFINIT.TOOLS
