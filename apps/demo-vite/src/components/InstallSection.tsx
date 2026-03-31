import { useState } from 'react';
import { type Translations } from '../i18n';

type Framework = 'nextjs' | 'vite';

interface InstallSectionProps {
  t: Translations['install'];
}

const CODE: Record<Framework, { label: string; blocks: { title: string; code: string }[] }> = {
  nextjs: {
    label: 'Next.js',
    blocks: [
      {
        title: '1. Install',
        code: `npm install --save-dev @vibedit/next`,
      },
      {
        title: '2. Wrap your Next.js config',
        code: `// next.config.mjs
import { withVibedit } from '@vibedit/next';

export default withVibedit({
  // your existing Next.js config
});`,
      },
      {
        title: '3. Add the overlay to your layout',
        code: `// app/layout.tsx
import { VibeditOverlay } from '@vibedit/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <VibeditOverlay />
      </body>
    </html>
  );
}`,
      },
    ],
  },
  vite: {
    label: 'Vite',
    blocks: [
      {
        title: '1. Install',
        code: `npm install --save-dev @vibedit/vite`,
      },
      {
        title: '2. Add the plugin to vite.config.ts',
        code: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vibedit } from '@vibedit/vite';

export default defineConfig({
  plugins: [
    react(),
    ...vibedit(),
  ],
});`,
      },
    ],
  },
};

function CodeBlock({
  title,
  code,
  copyLabel,
  copiedLabel,
}: {
  title: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid #1e1e35',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#0d0d18',
          borderBottom: '1px solid #1e1e35',
        }}
      >
        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{title}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: copied ? '#86efac' : '#475569',
            fontSize: '12px',
            fontFamily: 'inherit',
            padding: '2px 8px',
            borderRadius: '4px',
            transition: 'color 0.15s',
          }}
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '20px',
          background: '#080810',
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: 1.7,
          fontFamily: 'ui-monospace, Consolas, monospace',
          color: '#94a3b8',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function InstallSection({ t }: InstallSectionProps) {
  const [fw, setFw] = useState<Framework>('nextjs');

  return (
    <section
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '80px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: '#e2e8f0',
          letterSpacing: '-0.02em',
          marginBottom: '12px',
        }}
      >
        {t.title}
      </h2>
      <p
        style={{
          textAlign: 'center',
          fontSize: '16px',
          color: '#475569',
          marginBottom: '40px',
        }}
      >
        {t.subtitle}
      </p>

      {/* Framework tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '28px',
          background: '#0d0d18',
          border: '1px solid #1e1e35',
          borderRadius: '10px',
          padding: '4px',
          width: 'fit-content',
        }}
      >
        {(Object.keys(CODE) as Framework[]).map((key) => (
          <button
            key={key}
            onClick={() => setFw(key)}
            style={{
              padding: '7px 20px',
              borderRadius: '7px',
              border: 'none',
              background: fw === key ? '#1e1e35' : 'transparent',
              color: fw === key ? '#e2e8f0' : '#475569',
              fontSize: '13px',
              fontWeight: fw === key ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {CODE[key].label}
          </button>
        ))}
      </div>

      {CODE[fw].blocks.map((block) => (
        <CodeBlock
          key={block.title}
          title={block.title}
          code={block.code}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      ))}

      <p style={{ marginTop: '24px', fontSize: '14px', color: '#334155', textAlign: 'center' }}>
        {t.runNote}{' '}
        <code style={{ color: '#6366f1', fontFamily: 'ui-monospace, monospace' }}>
          npm run dev
        </code>{' '}
        {t.runNote2}
      </p>

      {/* Uninstall section */}
      <div
        style={{
          marginTop: '48px',
          padding: '24px 28px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#475569',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🗑️</span>
          {t.uninstallTitle}
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: '#334155',
            lineHeight: 1.7,
          }}
        >
          {t.uninstallDesc.split('`').map((part, i) =>
            i % 2 === 1 ? (
              <code
                key={i}
                style={{
                  fontFamily: 'ui-monospace, Consolas, monospace',
                  fontSize: '12px',
                  color: '#6366f1',
                  background: 'rgba(99,102,241,0.08)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                {part}
              </code>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      </div>
    </section>
  );
}
