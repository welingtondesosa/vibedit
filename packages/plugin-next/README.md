# @vibedit/next

> Visual editing overlay for Next.js — click any element, edit its styles and text, watch your source files update live.

**No AI. No cloud. No accounts. Everything stays local.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fnext?color=%236366f1)](https://www.npmjs.com/package/@vibedit/next)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/welingtondesosa/vibedit/blob/main/LICENSE)

## Install

```bash
npm install --save-dev @vibedit/next
```

## Setup

**`next.config.mjs`**
```js
import { withVibedit } from '@vibedit/next';

export default withVibedit({
  // your existing Next.js config
});
```

**`app/layout.tsx`** — add the overlay in development only:
```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Script src="/_vibedit/overlay.js" strategy="beforeInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
```

Run `npm run dev` and look for the Vibedit button in the bottom-right corner.

## Options

```ts
withVibedit(nextConfig, {
  port: 4242,        // WebSocket server port (default: 4242)
  undoLimit: 50,     // Max undo steps (default: 50)
  prettier: true,    // Format files with Prettier after writing (default: true)
})
```

## How it works

1. A Babel plugin injects `data-vibedit-file` and `data-vibedit-line` on every HTML element at compile time
2. A floating button activates the editor overlay (Shadow DOM isolated)
3. Click any element → panel shows editable CSS properties
4. Changes are written to source files using [ts-morph](https://ts-morph.com/) AST parsing — not regex

## What you can edit

- Inline CSS properties (color, spacing, typography, borders, shadows…)
- Text content — including i18n translation objects
- Full undo history

## Links

- [GitHub](https://github.com/welingtondesosa/vibedit)
- [Landing page & docs](https://vibedit.pages.dev)
- [Report an issue](https://github.com/welingtondesosa/vibedit/issues)

## License

MIT
