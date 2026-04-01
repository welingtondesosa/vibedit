import { useState } from 'react';
import { type Translations } from '../i18n';

interface HeroSectionProps {
  t: Translations['hero'];
}

export function HeroSection({ t }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText('npm install @vibedit/next').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section
      style={{
        textAlign: 'center',
        padding: 'clamp(60px, 10vw, 96px) 20px clamp(48px, 8vw, 80px)',
        maxWidth: '760px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '24px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#a5b4fc',
          marginBottom: '32px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        <span>✦</span>
        <span>{t.badge}</span>
      </div>

      <h1
        style={{
          fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingBottom: '10px',
        }}
      >
        {t.headline}
      </h1>

      <p
        style={{
          fontSize: '19px',
          color: '#64748b',
          maxWidth: '540px',
          margin: '0 auto 48px',
          lineHeight: 1.65,
        }}
      >
        {t.sub.split(t.subHighlight).map((part: string, i: number) =>
          i === 0 ? (
            <span key={i}>
              {part}
              <span style={{ color: '#94a3b8' }}>{t.subHighlight}</span>
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>

      {/* Install command */}
      <div className="vb-install-cmd">
        <span style={{ color: '#64748b', fontSize: '13px', userSelect: 'none' }}>$</span>
        <code
          style={{
            fontFamily: 'ui-monospace, Consolas, monospace',
            fontSize: '14px',
            color: '#e2e8f0',
            letterSpacing: '0.01em',
          }}
        >
          npm install @vibedit/next
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: copied ? '#86efac' : '#475569',
            fontSize: '13px',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'color 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {copied ? t.copied : t.copy}
        </button>
      </div>

      {/* Framework badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {['Next.js', 'Vite', 'Remix', 'React'].map((fw) => (
          <span
            key={fw}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '12px',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {fw}
          </span>
        ))}
      </div>
    </section>
  );
}
