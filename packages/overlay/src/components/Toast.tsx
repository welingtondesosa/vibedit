import React from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export function Toast({ toasts }: ToastProps): React.ReactElement | null {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#fff',
            background: toast.type === 'success' ? '#22c55e' : '#ef4444',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            animation: 'vibedit-fadein 0.2s ease',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
