import { useState } from 'react';
import { type Translations } from '../i18n';

interface HeroSectionProps {
  t: Translations['hero'];
}

const FRAMEWORK_PACKAGES: Record<string, string> = {
  'Next.js': '@vibedit/next',
  Vite: '@vibedit/vite',
  React: '@vibedit/vite',
};

export function HeroSection({ t }: HeroSectionProps) {
  const [copied, setCopied] = useState(false);
  const [selectedFw, setSelectedFw] = useState('Vite');

  const installCmd = `npm install ${FRAMEWORK_PACKAGES[selectedFw]}`;

  function handleCopy() {
    navigator.clipboard.writeText(installCmd).then(() => {
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
      {/* Top badge */}
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

      {/* Headline */}
      <h1
        style={{
          fontSize: '68px',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          paddingBottom: '10px',
        }}
      >
        {t.headline}
      </h1>

      {/* Key differentiator — most visible, right under headline */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '10px',
          padding: '8px 18px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#6ee7b7',
          marginBottom: '28px',
        }}
      >
        <span>🔒</span>
        <span>{t.localBadge}</span>
      </div>

      {/* Subheadline */}
      <p
        style={{
          fontSize: '18px',
          color: '#64748b',
          maxWidth: '520px',
          margin: '0 auto 44px',
          lineHeight: 1.65,
        }}
      >
        {t.sub}
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
          {installCmd}
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

      {/* Framework + GitHub */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {['Next.js', 'Vite', 'React'].map((fw) => (
          <button
            key={fw}
            onClick={() => {
              setSelectedFw(fw);
              setCopied(false);
            }}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              background: selectedFw === fw ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              border:
                selectedFw === fw
                  ? '1px solid rgba(99,102,241,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
              fontSize: '12px',
              color: selectedFw === fw ? '#a5b4fc' : '#64748b',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {fw}
          </button>
        ))}
        <a
          href="https://github.com/welingtondesosa/vibedit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 12px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '12px',
            color: '#64748b',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          ★ GitHub
        </a>
      </div>
    </section>
  );
}
