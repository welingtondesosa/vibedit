interface AiSectionProps {
  t: {
    badge: string;
    headline: string;
    sub: string;
    steps: string[];
    note: string;
    cta: string;
  };
}

export function AiSection({ t }: AiSectionProps) {
  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(60px, 8vw, 96px) 24px',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
        }}
      />

      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '24px',
              padding: '6px 18px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#a5b4fc',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ fontSize: '14px' }}>✨</span>
            {t.badge}
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t.headline}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '560px',
            margin: '0 auto 48px',
            lineHeight: 1.65,
          }}
        >
          {t.sub}
        </p>

        {/* Simulated AI panel */}
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto 40px',
            borderRadius: '16px',
            border: '1px solid rgba(99,102,241,0.25)',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 16px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Mock header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#0d0d1a',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '13px' }}>✨</span>
            <span
              style={{
                fontSize: '11px',
                color: '#475569',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              vibedit — AI assistant
            </span>
          </div>

          {/* Mock input */}
          <div style={{ padding: '16px', background: '#080810' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ color: '#64748b' }}>
                  &quot;add shadow and make it more modern&quot;
                </span>
              </div>
              <div
                style={{
                  background: '#1a56db',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Ask
              </div>
            </div>

            {/* Mock suggestions */}
            <div
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '10px',
                padding: '10px 12px',
              }}
            >
              {[
                ['border-radius', '12px'],
                ['box-shadow', '0 4px 24px rgba(0,0,0,0.12)'],
                ['background', 'linear-gradient(135deg, #667eea, #764ba2)'],
              ].map(([prop, val], i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 0',
                    fontSize: '12px',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  <span style={{ color: '#89b4fa', flex: '0 0 120px' }}>{prop}</span>
                  <span
                    style={{
                      color: '#94a3b8',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {val}
                  </span>
                  <span
                    style={{
                      color: '#4ade80',
                      fontSize: '11px',
                      border: '1px solid rgba(74,222,128,0.3)',
                      borderRadius: '4px',
                      padding: '1px 6px',
                    }}
                  >
                    ✓
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: '10px',
                  background: '#1a56db',
                  borderRadius: '8px',
                  padding: '7px 0',
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Apply all (3)
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {t.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#a5b4fc',
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Note + CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
            {t.note}
          </p>
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#a5b4fc',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '16px' }}>↗</span>
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
