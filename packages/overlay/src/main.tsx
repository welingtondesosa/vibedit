import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const HOST_ID = 'vibedit-overlay-host';

function mount(): void {
  // Don't mount twice
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('data-vibedit', '');
  // Host is invisible — children render fixed-positioned elements
  host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:999997;pointer-events:none;';
  document.body.appendChild(host);

  // Attach shadow DOM for style encapsulation
  const shadow = host.attachShadow({ mode: 'open' });
  const mountPoint = document.createElement('div');
  mountPoint.style.cssText = 'pointer-events:all;';
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
