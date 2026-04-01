# Vibedit

> Visual editing overlay for React apps — click any element, edit its styles and text, watch your source files update live.

**No AI. No cloud. No accounts. Everything runs locally.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fnext?color=%236366f1&label=%40vibedit%2Fnext)](https://www.npmjs.com/package/@vibedit/next)
[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fvite?color=%236366f1&label=%40vibedit%2Fvite)](https://www.npmjs.com/package/@vibedit/vite)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## What is Vibedit?

Vibedit injects a non-intrusive editing overlay into your React app during development. Activate it with the floating button, click any element, and a panel appears showing all its editable CSS properties. Changes are written directly to your source files using AST parsing (ts-morph) — not regex, not string replacement. Reload the page and your changes are still there.

Works with **Next.js**, **Vite**, and any React-based framework.

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

3. **Server** — A local Node.js server (port 4242) receives edit messages and writes changes back to source files using [ts-morph](https://ts-morph.com/) AST manipulation. Supports inline styles, text content, and i18n translation objects.

4. **Zero production impact** — The plugin uses `apply: 'serve'` (Vite) or `NODE_ENV === 'development'` (Next.js) to ensure nothing is injected into production builds.

---

## What you can edit

| Feature | Status |
|---|---|
| Inline style properties (color, spacing, typography, etc.) | ✅ |
| Text content (direct JSX text) | ✅ |
| Text from i18n / translation objects | ✅ |
| Undo history | ✅ |
| Element reordering (drag & drop) | ✅ |
| Tailwind classes | 🔜 v1.1 |
| CSS Modules | 🔜 planned |

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
