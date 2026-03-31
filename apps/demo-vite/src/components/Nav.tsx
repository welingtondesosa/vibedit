import { type Lang, LANG_LABELS } from '../i18n';

interface NavProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

export function Nav({ lang, onLangChange }: NavProps) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '56px',
        background: 'rgba(15,15,20,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        style={{
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#e2e8f0',
          flexShrink: 0,
        }}
      >
        Vibedit
      </span>

      <div className="vb-nav-links">
        {/* Language selector */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            padding: '3px',
            marginRight: '4px',
          }}
        >
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: 'none',
                background: lang === l ? '#1e1e35' : 'transparent',
                color: lang === l ? '#a5b4fc' : '#475569',
                fontSize: '11px',
                fontWeight: lang === l ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <a
          href="https://www.npmjs.com/org/vibedit"
          target="_blank"
          rel="noopener noreferrer"
          className="vb-nav-text-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid #2a2a45',
            background: 'transparent',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          npm
        </a>
        <a
          href="https://github.com/welingtondesosa/vibedit"
          target="_blank"
          rel="noopener noreferrer"
          className="vb-nav-text-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid #2a2a45',
            background: 'transparent',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}
