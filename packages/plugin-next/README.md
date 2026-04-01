# @vibedit/next

> Visual editing overlay for Next.js — click any element, edit its styles and text, watch your source files update live.

**No AI. No cloud. No accounts. Everything stays local.**

[![npm version](https://img.shields.io/npm/v/%40vibedit%2Fnext?color=%236366f1)](https://www.npmjs.com/package/@vibedit/next)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/welingtondesosa/vibedit/blob/main/LICENSE)

## Install

The fastest way — one command sets everything up automatically:

```bash
npx @vibedit/next init
```

This will:
- Install `@vibedit/next` as a devDependency
- Patch your `next.config.mjs` with `withVibedit`
- Inject the overlay `<Script>` into your `app/layout.tsx`

Then restart your dev server and look for the Vibedit button in the bottom-right corner.

---

## Manual setup

If you prefer to configure manually:

**1. Install**
```bash
npm install --save-dev @vibedit/next
```

**2. `next.config.mjs`**
```js
import { withVibedit } from '@vibedit/next';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withVibedit(nextConfig);
```

**3. `app/layout.tsx`**
```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <Script src="/_vibedit/overlay.js" strategy="beforeInteractive" />
        )}
      </body>
    </html>
  );
}
```

**4.** Run `npm run dev` and look for the Vibedit button in the bottom-right corner.

---

## Options

```ts
withVibedit(nextConfig, {
  port: 4242,        // WebSocket server port (default: 4242)
  undoLimit: 50,     // Max undo steps (default: 50)
  prettier: true,    // Format files with Prettier after writing (default: true)
})
```

## What you can edit

- Inline CSS properties (color, spacing, typography, borders, shadows…)
- Text content — including i18n translation objects
- Full undo history (Ctrl+Z in browser)

## Compatibility

Works with Next.js 13+ (App Router and Pages Router). Tested with Next.js 15.

## Links

- [GitHub](https://github.com/welingtondesosa/vibedit)
- [Landing page](https://vibedit.pages.dev)
- [Report an issue](https://github.com/welingtondesosa/vibedit/issues)

## License

MIT
