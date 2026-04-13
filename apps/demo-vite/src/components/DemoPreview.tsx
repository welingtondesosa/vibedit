export function DemoPreview() {
  return (
    <section
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px 80px',
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 24px 64px rgba(0,0,0,0.5)',
          background: '#080810',
          position: 'relative',
        }}
      >
        {/* Window chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 16px',
            background: '#0d0d18',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'block' }} />
          <span
            style={{
              marginLeft: '8px',
              fontSize: '11px',
              color: '#334155',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            vibedit — live demo
          </span>
        </div>

        {/* Placeholder while GIF is hosted externally */}
        <div
          style={{
            height: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: '#080810',
            color: '#1e293b',
          }}
        >
          <span style={{ fontSize: '48px' }}>▶</span>
          <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>
            Demo coming soon
          </p>
        </div>
      </div>
    </section>
  );
}
