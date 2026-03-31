import { useCallback } from 'react';

interface UseUndoProps {
  send: (message: unknown) => Promise<{ success: boolean; error?: string }>;
}

export function useUndo({ send }: UseUndoProps) {
  const undo = useCallback(async () => {
    const result = await send({ change: { type: 'undo' } });
    return result;
  }, [send]);

  return { undo };
}
