# @vibedit/vite

> Visual editing overlay for Vite — click any element, edit its styles and text, watch your source files update live.

**No AI. No cloud. No accounts. Everything stays local.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fvite?color=%236366f1)](https://www.npmjs.com/package/@vibedit/vite)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/welingtondesosa/vibedit/blob/main/LICENSE)

## Install

The fastest way — one command sets everything up automatically:

```bash
npx @vibedit/vite init
```

This will:
- Install `@vibedit/vite` as a devDependency
- Add the `vibedit()` plugin to your `vite.config.ts`
- If you deploy to Cloudflare Pages or similar, it creates a separate `vite.config.dev.ts` so your production build stays clean

Then run `npm run dev` and look for the Vibedit button in the bottom-right corner.

---

## Manual setup

```bash
npm install --save-dev @vibedit/vite
```

**`vite.config.ts`**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vibedit } from '@vibedit/vite';

export default defineConfig({
  plugins: [react(), vibedit()],
});
```

> **Cloudflare Pages / production deploys:** Keep your production `vite.config.ts` without the vibedit import. Create a `vite.config.dev.ts` with the plugin and run dev as `vite --config vite.config.dev.ts`.

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
