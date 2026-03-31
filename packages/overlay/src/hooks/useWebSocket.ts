import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketHook {
  send: (message: unknown) => Promise<{ success: boolean; error?: string }>;
  connected: boolean;
}

const VIBEDIT_WS_PORT = (window as unknown as { __VIBEDIT_PORT__?: number }).__VIBEDIT_PORT__ ?? 4242;

export function useWebSocket(): WebSocketHook {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<string, (response: { success: boolean; error?: string }) => void>>(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:${VIBEDIT_WS_PORT}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as { id?: string; success?: boolean; error?: string; type?: string };
        if (data.type === 'ready') return;

        if (data.id && pendingRef.current.has(data.id)) {
          const resolve = pendingRef.current.get(data.id)!;
          pendingRef.current.delete(data.id);
          resolve({ success: data.success ?? false, error: data.error });
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const send = useCallback((message: unknown): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const payload = { id, ...(message as object) };

      pendingRef.current.set(id, resolve);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        pendingRef.current.delete(id);
        resolve({ success: false, error: 'WebSocket not connected' });
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          resolve({ success: false, error: 'Timeout' });
        }
      }, 5000);
    });
  }, []);

  return { send, connected };
}
