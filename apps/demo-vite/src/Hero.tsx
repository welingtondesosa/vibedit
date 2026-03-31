type Lang = 'en' | 'es' | 'pt';

interface HeroProps {
  lang: Lang;
}

const COPY = {
  en: {
    badge: 'Open Source · No AI · No Credits',
    headline: 'Vibedit',
    sub: 'Click any element, tweak its styles in the panel, and watch your source files update live.',
  },
  es: {
    badge: 'Open Source · Sin IA · Sin Créditos',
    headline: 'Vibedit',
    sub: 'Hacé clic en cualquier elemento, editá sus estilos en el panel, y mirá cómo se actualiza el código fuente en tiempo real.',
  },
  pt: {
    badge: 'Open Source · Sem IA · Sem Créditos',
    headline: 'Vibedit',
    sub: 'Clique em qualquer elemento, ajuste os estilos no painel e veja seu código-fonte atualizar em tempo real.',
  },
} satisfies Record<Lang, { badge: string; headline: string; sub: string }>;

export function Hero({ lang }: HeroProps) {
  const t = COPY[lang];

  return (
    <section
      style={{
        textAlign: 'center',
        padding: '80px 24px 64px',
        maxWidth: '960px',
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
          fontSize: '13px',
          fontWeight: 600,
          color: '#a5b4fc',
          marginBottom: '32px',
          letterSpacing: '0.02em',
        }}
      >
        <span>✦</span>
        <span>{t.badge}</span>
      </div>

      <h1
        style={{
          fontSize: '64px',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {t.headline}
      </h1>

      <p
        style={{
          fontSize: '20px',
          color: '#94a3b8',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}
      >
        {t.sub}
      </p>
    </section>
  );
}
