import { type Translations } from '../i18n';

interface FooterProps {
  t: Translations['footer'];
}

export function Footer({ t }: FooterProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      <div>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#334155', letterSpacing: '-0.01em' }}>
          Vibedit
        </span>
        <span style={{ fontSize: '13px', color: '#1e293b', marginLeft: '12px' }}>
          MIT License
        </span>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <a href="https://github.com/welingtondesosa/vibedit" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '13px', color: '#334155', textDecoration: 'none' }}>
          GitHub
        </a>
        <a href="https://www.npmjs.com/package/@vibedit/next" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '13px', color: '#334155', textDecoration: 'none' }}>
          npm
        </a>
        <a href="https://github.com/welingtondesosa/vibedit/issues" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '13px', color: '#334155', textDecoration: 'none' }}>
          {t.reportIssue}
        </a>
      </div>
    </footer>
  );
}
