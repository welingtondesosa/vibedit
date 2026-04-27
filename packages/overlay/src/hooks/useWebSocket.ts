import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketHook {
  send: (message: unknown) => Promise<{ success: boolean; error?: string }>;
  connected: boolean;
}

const VIBEDIT_WS_PORT = (window as unknown as { __VIBEDIT_PORT__?: number }).__VIBEDIT_PORT__ ?? 4242;

export function useWebSocket(onPush?: (data: Record<string, unknown>) => void): WebSocketHook {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<string, (response: { success: boolean; error?: string }) => void>>(new Map());
  const onPushRef = useRef(onPush);
  const [connected, setConnected] = useState(false);

  useEffect(() => { onPushRef.current = onPush; }, [onPush]);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:${VIBEDIT_WS_PORT}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as { id?: string; success?: boolean; error?: string; type?: string; data?: Record<string, unknown> };

        // Server push (no id) — dispatch to callback
        if (!data.id) {
          if (data.type !== 'ready') onPushRef.current?.(data as Record<string, unknown>);
          return;
        }

        if (pendingRef.current.has(data.id)) {
          const resolve = pendingRef.current.get(data.id)!;
          pendingRef.current.delete(data.id);
          resolve({ success: data.success ?? false, error: data.error, ...(data.data ? { data: data.data } : {}) });
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const send = useCallback((message: unknown): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> => {
    return new Promise((resolve) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const payload = { id, ...(message as object) };

      const isAi = (message as { change?: { type?: string } })?.change?.type === 'ai';
      const timeoutMs = isAi ? 60_000 : 5_000;

      pendingRef.current.set(id, resolve as (r: { success: boolean; error?: string }) => void);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        pendingRef.current.delete(id);
        resolve({ success: false, error: 'WebSocket not connected' });
      }

      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          resolve({ success: false, error: isAi ? 'AI request timed out (60s)' : 'Timeout' });
        }
      }, timeoutMs);
    });
  }, []);

  return { send, connected };
}
