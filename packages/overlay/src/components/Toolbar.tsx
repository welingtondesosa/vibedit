import React from 'react';

interface ToolbarProps {
  isActive: boolean;
  connected: boolean;
  onToggle: () => void;
}

// Cursor + pencil SVG icon (24px)
function VibeditIcon({ active }: { active: boolean }): React.ReactElement {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cursor arrow */}
      <path
        d="M4 3L4 17L8 13L10.5 19L12.5 18.2L10 12L15 12L4 3Z"
        fill={active ? '#ffffff' : '#94A3B8'}
        stroke={active ? '#ffffff' : '#94A3B8'}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* Pencil */}
      <path
        d="M15 14L18 11L21 14L18 17L15 14Z"
        fill={active ? '#93C5FD' : '#64748B'}
      />
      <path
        d="M18 11L19.5 9.5C20 9 20.5 9 21 9.5L21.5 10C22 10.5 22 11 21.5 11.5L20 13L18 11Z"
        fill={active ? '#BFDBFE' : '#94A3B8'}
      />
      <path
        d="M15 14L14.5 16.5L17 16L15 14Z"
        fill={active ? '#93C5FD' : '#64748B'}
      />
    </svg>
  );
}

export function Toolbar({ isActive, connected, onToggle }: ToolbarProps): React.ReactElement {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <button
        onClick={onToggle}
        title={`${isActive ? 'Desactivar' : 'Activar'} edición visual (Ctrl+Shift+E)`}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          background: isActive ? '#1A56DB' : 'rgba(30, 41, 59, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: isActive
            ? '0 4px 12px rgba(26, 86, 219, 0.45)'
            : '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <VibeditIcon active={isActive} />
        {/* Connection indicator dot */}
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: connected ? '#10B981' : '#EF4444',
            boxShadow: connected ? '0 0 4px #10B981' : 'none',
          }}
        />
      </button>
    </div>
  );
}
