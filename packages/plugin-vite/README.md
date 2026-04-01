# @vibedit/vite

> Visual editing overlay for Vite — click any element, edit its styles and text, watch your source files update live.

**No AI. No cloud. No accounts. Everything stays local.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fvite?color=%236366f1)](https://www.npmjs.com/package/@vibedit/vite)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/welingtondesosa/vibedit/blob/main/LICENSE)

## Install

```bash
npm install --save-dev @vibedit/vite
```

## Setup

**`vite.config.ts`** (dev only — keep your production config separate):
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vibedit } from '@vibedit/vite';

export default defineConfig({
  plugins: [react(), vibedit()],
});
```

> **Tip:** If you deploy with Cloudflare Pages or similar, create a separate `vite.config.dev.ts` with vibedit and run dev as `vite --config vite.config.dev.ts`. Keep your production `vite.config.ts` without the import so the build never tries to resolve `@vibedit/vite`.

Run `npm run dev` and look for the Vibedit button in the bottom-right corner.

## Options

```ts
vibedit({
  port: 4242,        // WebSocket server port (default: 4242)
  undoLimit: 50,     // Max undo steps (default: 50)
  prettier: true,    // Format files with Prettier after writing (default: true)
})
```

## How it works

1. A `transform` hook with `enforce: 'pre'` injects `data-vibedit-file` and `data-vibedit-line` on every HTML element at compile time — works independently of `@vitejs/plugin-react`'s babel config
2. A floating button activates the editor overlay (Shadow DOM isolated)
3. Click any element → panel shows editable CSS properties
4. Changes are written to source files using [ts-morph](https://ts-morph.com/) AST parsing — not regex

## What you can edit

- Inline CSS properties (color, spacing, typography, borders, shadows…)
- Text content — including i18n translation objects
- Full undo history

## Compatibility

Works with Vite 4+ and React 17+. Tested with React 19 + Vite 8.

## Links

- [GitHub](https://github.com/welingtondesosa/vibedit)
- [Landing page & docs](https://vibedit.pages.dev)
- [Report an issue](https://github.com/welingtondesosa/vibedit/issues)

## License

MIT
