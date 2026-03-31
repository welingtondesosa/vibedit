import { type Translations } from '../i18n';

interface OpenSourceSectionProps {
  t: Translations['openSource'];
}

export function OpenSourceSection({ t }: OpenSourceSectionProps) {
  return (
    <section
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '80px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: 'clamp(22px, 4vw, 32px)',
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
          marginBottom: '48px',
          maxWidth: '600px',
          margin: '0 auto 48px',
        }}
      >
        {t.subtitle}
      </p>

      <div className="vb-grid-opensource">
        {t.cards.map((card) => (
          <article
            key={card.title}
            style={{
              background: '#0d0d18',
              border: '1px solid #1e1e35',
              borderRadius: '16px',
              padding: '32px 28px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px', lineHeight: 1 }}>
              {card.icon}
            </div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#475569',
                lineHeight: 1.7,
              }}
            >
              {card.description.split('`').map((part, i) =>
                i % 2 === 1 ? (
                  <code
                    key={i}
                    style={{
                      fontFamily: 'ui-monospace, Consolas, monospace',
                      fontSize: '12px',
                      color: '#a5b4fc',
                      background: 'rgba(99,102,241,0.1)',
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
          </article>
        ))}
      </div>
    </section>
  );
}
