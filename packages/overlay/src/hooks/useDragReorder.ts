import { useEffect, useRef } from 'react';
import { isVibeditElement, getRelativePath } from '../utils/domHelpers';
import { getSourceInfo } from '../utils/reactFiber';

interface UseDragReorderProps {
  active: boolean;
  send: (msg: unknown) => Promise<{ success: boolean; error?: string }>;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

/** Returns element-only children, excluding vibedit overlays */
function getElementSiblings(parent: Element): HTMLElement[] {
  return Array.from(parent.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && !isVibeditElement(c)
  );
}

export function useDragReorder({ active, send, onToast }: UseDragReorderProps): void {
  // Use refs so event handlers always have the latest send/onToast without re-running the effect
  const sendRef = useRef(send);
  const onToastRef = useRef(onToast);
  useEffect(() => { sendRef.current = send; }, [send]);
  useEffect(() => { onToastRef.current = onToast; }, [onToast]);

  useEffect(() => {
    if (!active) return;

    // ── Drag handle ──────────────────────────────────────────────────────────
    const handle = document.createElement('div');
    handle.setAttribute('data-vibedit', '');
    handle.title = 'Arrastrar para reordenar';
    handle.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="3" cy="2" r="1.2" fill="#94A3B8"/>
        <circle cx="9" cy="2" r="1.2" fill="#94A3B8"/>
        <circle cx="3" cy="6" r="1.2" fill="#94A3B8"/>
        <circle cx="9" cy="6" r="1.2" fill="#94A3B8"/>
        <circle cx="3" cy="10" r="1.2" fill="#94A3B8"/>
        <circle cx="9" cy="10" r="1.2" fill="#94A3B8"/>
      </svg>
    `;
    handle.style.cssText = `
      position: fixed; pointer-events: all;
      width: 20px; height: 20px;
      background: #1E293B; border: 1px solid #334155;
      border-radius: 4px; cursor: grab;
      display: none; align-items: center; justify-content: center;
      z-index: 999997; user-select: none;
    `;
    handle.style.display = 'none';
    document.body.appendChild(handle);

    // ── Drop line indicator ──────────────────────────────────────────────────
    const dropLine = document.createElement('div');
    dropLine.setAttribute('data-vibedit', '');
    dropLine.style.cssText = `
      position: fixed; pointer-events: none;
      height: 2px; background: #1A56DB;
      border-radius: 1px; display: none; z-index: 999997;
      box-shadow: 0 0 4px rgba(26,86,219,0.5);
    `;
    document.body.appendChild(dropLine);

    // ── State ────────────────────────────────────────────────────────────────
    let hoveredEl: HTMLElement | null = null;
    let dragEl: HTMLElement | null = null;
    let dragParent: Element | null = null;
    let dragSiblings: HTMLElement[] = [];
    let fromIndex = -1;
    let toIndex = -1;
    let isDragging = false;

    const showHandle = (target: HTMLElement): void => {
      const rect = target.getBoundingClientRect();
      handle.style.display = 'flex';
      handle.style.left = `${rect.left + 4}px`;
      handle.style.top = `${rect.top + 4}px`;
    };

    const updateDropIndicator = (cursorY: number): void => {
      if (!dragParent) return;

      let newToIndex = dragSiblings.length - 1;
      let lineY = -1;
      const parentRect = dragParent.getBoundingClientRect();

      for (let i = 0; i < dragSiblings.length; i++) {
        const sibling = dragSiblings[i];
        if (sibling === dragEl) continue;
        const rect = sibling.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;

        if (cursorY < mid) {
          newToIndex = i > 0 ? i - 1 : 0;
          lineY = rect.top - 1;
          break;
        }
        newToIndex = i;
        lineY = rect.bottom + 1;
      }

      toIndex = newToIndex;

      if (lineY >= 0) {
        dropLine.style.display = 'block';
        dropLine.style.left = `${parentRect.left + 8}px`;
        dropLine.style.top = `${lineY}px`;
        dropLine.style.width = `${parentRect.width - 16}px`;
      } else {
        dropLine.style.display = 'none';
      }
    };

    // ── Mouse move ───────────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent): void => {
      if (isDragging) {
        updateDropIndicator(e.clientY);
        return;
      }

      const target = e.target as HTMLElement;

      // Keep handle visible when hovering over it
      if (target === handle) return;

      if (
        !target ||
        isVibeditElement(target) ||
        target === document.body ||
        target === document.documentElement
      ) {
        handle.style.display = 'none';
        hoveredEl = null;
        return;
      }

      // Only show handle for elements that have at least one sibling (reorder makes sense)
      const parent = target.parentElement;
      if (!parent || getElementSiblings(parent).length < 2) {
        handle.style.display = 'none';
        hoveredEl = null;
        return;
      }

      hoveredEl = target;
      showHandle(target);
    };

    // ── Mousedown on handle: start drag ─────────────────────────────────────
    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!hoveredEl?.parentElement) return;

      isDragging = true;
      dragEl = hoveredEl;
      dragParent = hoveredEl.parentElement;
      dragSiblings = getElementSiblings(dragParent);
      fromIndex = dragSiblings.indexOf(dragEl);
      toIndex = fromIndex;

      dragEl.style.opacity = '0.4';
      handle.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    });

    // ── Mouseup: drop ────────────────────────────────────────────────────────
    const handleMouseUp = (): void => {
      if (!isDragging || !dragEl || !dragParent) return;

      isDragging = false;
      dragEl.style.opacity = '';
      handle.style.cursor = 'grab';
      handle.style.display = 'none';
      document.body.style.cursor = 'crosshair';
      document.body.style.userSelect = '';
      dropLine.style.display = 'none';

      const finalFrom = fromIndex;
      const finalTo = toIndex;
      const parent = dragParent;

      dragEl = null;
      dragParent = null;
      dragSiblings = [];
      fromIndex = -1;
      toIndex = -1;

      if (finalTo === -1 || finalTo === finalFrom) return;

      const sourceInfo = getSourceInfo(parent);
      if (!sourceInfo) {
        onToastRef.current('Sin source info en el padre — no se puede reordenar', 'error');
        return;
      }

      void sendRef.current({
        change: {
          type: 'reorder',
          file: sourceInfo.fileName,
          parentLine: sourceInfo.lineNumber,
          parentColumn: sourceInfo.columnNumber,
          fromIndex: finalFrom,
          toIndex: finalTo,
        },
      }).then((result) => {
        if (result.success) {
          onToastRef.current(`Reordenado: posición ${finalFrom} → ${finalTo}`, 'success');
        } else {
          onToastRef.current(result.error ?? 'Error al reordenar', 'error');
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handle.remove();
      dropLine.remove();
    };
  }, [active]);
}
