import { type Translations } from '../i18n';

interface FeaturesProps {
  t: Translations['features'];
}

export function Features({ t }: FeaturesProps) {
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
          marginBottom: '56px',
        }}
      >
        {t.subtitle}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {t.items.map((f) => (
          <article
            key={f.title}
            style={{
              background: '#0d0d18',
              border: '1px solid #1e1e35',
              borderRadius: '16px',
              padding: '28px 24px',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '14px', lineHeight: 1 }}>{f.icon}</div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              {f.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65 }}>
              {f.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
