import { type Translations } from '../i18n';

interface HowItWorksProps {
  t: Translations['howItWorks'];
}

export function HowItWorks({ t }: HowItWorksProps) {
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

      <div className="vb-grid-3">
        {t.steps.map((step: { number: string; title: string; description: string }) => (
          <div
            key={step.number}
            style={{
              background: '#0d0d18',
              border: '1px solid #1e1e35',
              borderRadius: '16px',
              padding: '32px 28px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#6366f1',
                letterSpacing: '0.08em',
                marginBottom: '16px',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {step.number}
            </div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: '12px',
                letterSpacing: '-0.01em',
              }}
            >
              {step.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
