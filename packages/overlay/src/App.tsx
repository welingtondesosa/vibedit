import React, { useState, useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { ElementPicker } from './components/ElementPicker';
import { EditPanel } from './components/EditPanel';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { SelectedElement } from './hooks/useElementPicker';
import { useWebSocket } from './hooks/useWebSocket';
import { useUndo } from './hooks/useUndo';
import { useDragReorder } from './hooks/useDragReorder';
import { getSourceInfo } from './utils/reactFiber';
import { getRelativePath } from './utils/domHelpers';

const GLOBAL_STYLES = `
  @keyframes vibedit-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vibedit-slidein {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }
`;

const SESSION_KEY = 'vibedit-active';

export function App(): React.ReactElement {
  const [isActive, setIsActive] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { send, connected } = useWebSocket();
  const { undo } = useUndo({ send });

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = `${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useDragReorder({ active: isActive, send, onToast: addToast });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, String(isActive));
    } catch { /* ignore */ }
  }, [isActive]);

  useEffect(() => {
    document.body.style.cursor = isActive ? 'crosshair' : '';
    return () => { document.body.style.cursor = ''; };
  }, [isActive]);

  const handleToggle = useCallback(() => {
    setIsActive((prev) => {
      if (prev) setSelected(null);
      return !prev;
    });
  }, []);

  const handleTextEdit = useCallback(
    async (element: Element, oldText: string, newText: string): Promise<void> => {
      const sourceInfo = getSourceInfo(element);
      if (!sourceInfo) {
        addToast('No source info — run in React dev mode', 'error');
        return;
      }
      const result = await send({
        change: {
          type: 'text',
          file: getRelativePath(sourceInfo.fileName),
          line: sourceInfo.lineNumber,
          column: sourceInfo.columnNumber,
          oldText,
          newText,
        },
      });
      if (result.success) {
        addToast('Text updated', 'success');
      } else {
        addToast(result.error ?? 'Failed to update text', 'error');
      }
    },
    [send, addToast]
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent): void => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        handleToggle();
        return;
      }
      if (e.key === 'Escape' && isActive && selected) {
        e.preventDefault();
        setSelected(null);
        return;
      }
      if (e.ctrlKey && e.key === 'z' && isActive) {
        e.preventDefault();
        undo().then((result) => {
          addToast(result.success ? 'Undone' : (result.error ?? 'Nothing to undo'), result.success ? 'success' : 'error');
        });
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isActive, selected, undo, addToast, handleToggle]);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <Toolbar isActive={isActive} connected={connected} onToggle={handleToggle} />
      {isActive && (
        <ElementPicker
          onSelect={setSelected}
          onTextEdit={handleTextEdit}
          selectedElement={selected?.element}
        />
      )}
      {isActive && selected && (
        <EditPanel
          selected={selected}
          send={send}
          onClose={() => setSelected(null)}
          onToast={addToast}
        />
      )}
      <Toast toasts={toasts} />
    </>
  );
}
