import { useEffect, useRef } from 'react';
import { getComputedStyles, isVibeditElement, getRelativePath } from '../utils/domHelpers';
import { getComponentName, getSourceInfo, getComponentProps } from '../utils/reactFiber';
import type { ComponentProp } from '../utils/reactFiber';

export interface SelectedElement {
  element: Element;
  sourceFile: string;
  line: number;
  column: number;
  styles: Record<string, string>;
  componentName: string;
  props: ComponentProp[];
}

interface UseElementPickerProps {
  active: boolean;
  onSelect: (el: SelectedElement) => void;
  onTextEdit?: (element: Element, oldText: string, newText: string) => void;
  selectedElement?: Element | null;
}

/** Returns the trimmed text from direct TEXT_NODE children only */
function getDirectText(element: Element): string {
  const parts: string[] = [];
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      parts.push(node.textContent);
    }
  }
  return parts.join('').trim();
}

export function useElementPicker({
  active,
  onSelect,
  onTextEdit,
  selectedElement,
}: UseElementPickerProps): void {
  const hoverHighlightRef = useRef<HTMLDivElement | null>(null);
  const selectionHighlightRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const isEditingTextRef = useRef(false);

  // Update selection highlight position when selectedElement changes externally
  useEffect(() => {
    const sel = selectionHighlightRef.current;
    if (!sel) return;

    if (!selectedElement || !active) {
      sel.style.display = 'none';
      return;
    }

    const rect = selectedElement.getBoundingClientRect();
    sel.style.display = 'block';
    sel.style.left = `${rect.left}px`;
    sel.style.top = `${rect.top}px`;
    sel.style.width = `${rect.width}px`;
    sel.style.height = `${rect.height}px`;
  }, [selectedElement, active]);

  useEffect(() => {
    if (!active) {
      if (hoverHighlightRef.current) hoverHighlightRef.current.style.display = 'none';
      if (selectionHighlightRef.current) selectionHighlightRef.current.style.display = 'none';
      if (tooltipRef.current) tooltipRef.current.style.display = 'none';
      return;
    }

    // ── Hover highlight ──────────────────────────────────────────────────────
    const hover = document.createElement('div');
    hover.setAttribute('data-vibedit', '');
    hover.style.cssText = `
      position: fixed; pointer-events: none;
      border: 2px solid #1A56DB;
      background: rgba(26, 86, 219, 0.08);
      border-radius: 2px; z-index: 999996; display: none; box-sizing: border-box;
    `;
    document.body.appendChild(hover);
    hoverHighlightRef.current = hover;

    // ── Selection highlight ──────────────────────────────────────────────────
    const sel = document.createElement('div');
    sel.setAttribute('data-vibedit', '');
    sel.style.cssText = `
      position: fixed; pointer-events: none;
      border: 3px solid #1A56DB;
      background: rgba(26, 86, 219, 0.12);
      border-radius: 2px; z-index: 999995; display: none; box-sizing: border-box;
    `;
    document.body.appendChild(sel);
    selectionHighlightRef.current = sel;

    // ── Tooltip ──────────────────────────────────────────────────────────────
    const tooltip = document.createElement('div');
    tooltip.setAttribute('data-vibedit', '');
    tooltip.style.cssText = `
      position: fixed; pointer-events: none;
      background: #1E293B; color: #F8FAFC;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px; padding: 6px 10px;
      border-radius: 6px; z-index: 999999; display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4); line-height: 1.5;
      max-width: 260px; white-space: nowrap;
    `;
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // Restore selection highlight if an element is already selected
    if (selectedElement) {
      const rect = selectedElement.getBoundingClientRect();
      sel.style.display = 'block';
      sel.style.left = `${rect.left}px`;
      sel.style.top = `${rect.top}px`;
      sel.style.width = `${rect.width}px`;
      sel.style.height = `${rect.height}px`;
    }

    // Update selection highlight on scroll / resize
    const updateSelectionHighlight = (): void => {
      if (!selectedElement || sel.style.display === 'none') return;
      const rect = selectedElement.getBoundingClientRect();
      sel.style.left = `${rect.left}px`;
      sel.style.top = `${rect.top}px`;
      sel.style.width = `${rect.width}px`;
      sel.style.height = `${rect.height}px`;
    };
    window.addEventListener('scroll', updateSelectionHighlight, true);
    window.addEventListener('resize', updateSelectionHighlight);

    // ── mousemove ────────────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent): void => {
      if (isEditingTextRef.current) return;
      const target = e.target as Element;

      if (
        !target ||
        isVibeditElement(target) ||
        target === document.body ||
        target === document.documentElement
      ) {
        hover.style.display = 'none';
        tooltip.style.display = 'none';
        return;
      }

      const rect = target.getBoundingClientRect();
      hover.style.display = 'block';
      hover.style.left = `${rect.left}px`;
      hover.style.top = `${rect.top}px`;
      hover.style.width = `${rect.width}px`;
      hover.style.height = `${rect.height}px`;

      // Tooltip
      const componentName = getComponentName(target);
      const sourceInfo = getSourceInfo(target);
      const sourceText = sourceInfo
        ? `${getRelativePath(sourceInfo.fileName)}:${sourceInfo.lineNumber}`
        : target.tagName.toLowerCase();

      tooltip.innerHTML = `
        <div style="font-weight:700">${componentName}</div>
        <div style="color:#94A3B8;font-size:11px;margin-top:2px">${sourceText}</div>
      `;
      tooltip.style.display = 'block';

      // Position tooltip above element (or below if no room)
      let tipTop = rect.top - 52;
      if (tipTop < 4) tipTop = rect.bottom + 8;
      const tipLeft = Math.max(4, Math.min(rect.left, window.innerWidth - 270));
      tooltip.style.left = `${tipLeft}px`;
      tooltip.style.top = `${tipTop}px`;
    };

    // ── click: select ────────────────────────────────────────────────────────
    const handleClick = (e: MouseEvent): void => {
      if (isEditingTextRef.current) return;
      const target = e.target as Element;
      if (!target || isVibeditElement(target)) return;

      e.preventDefault();
      e.stopPropagation();
      tooltip.style.display = 'none';

      const sourceInfo = getSourceInfo(target);
      onSelect({
        element: target,
        sourceFile: sourceInfo?.fileName ?? '',
        line: sourceInfo?.lineNumber ?? 0,
        column: sourceInfo?.columnNumber ?? 0,
        styles: getComputedStyles(target),
        componentName: getComponentName(target),
        props: getComponentProps(target),
      });
    };

    // ── double-click: inline text editing ───────────────────────────────────
    const handleDblClick = (e: MouseEvent): void => {
      const target = e.target as Element;
      if (!target || isVibeditElement(target)) return;

      const directText = getDirectText(target);
      if (!directText) return;

      e.preventDefault();
      e.stopPropagation();

      isEditingTextRef.current = true;
      hover.style.display = 'none';
      tooltip.style.display = 'none';

      const el = target as HTMLElement;
      const originalText = el.textContent ?? '';
      el.contentEditable = 'true';
      el.style.outline = '2px dashed #10B981';
      el.style.outlineOffset = '2px';
      el.style.cursor = 'text';
      el.focus();

      // Select all text
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const cleanup = (): void => {
        el.contentEditable = 'false';
        el.style.outline = '';
        el.style.outlineOffset = '';
        el.style.cursor = '';
        isEditingTextRef.current = false;
        el.removeEventListener('keydown', onKeydown);
        el.removeEventListener('blur', onBlur);
      };

      const onKeydown = (ev: KeyboardEvent): void => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          el.blur();
        } else if (ev.key === 'Escape') {
          el.textContent = originalText;
          cleanup();
        }
      };

      const onBlur = (): void => {
        const newText = (el.textContent ?? '').trim();
        cleanup();
        if (newText !== directText && onTextEdit) {
          onTextEdit(target, directText, newText);
        }
      };

      el.addEventListener('keydown', onKeydown);
      el.addEventListener('blur', onBlur);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('dblclick', handleDblClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('dblclick', handleDblClick, true);
      window.removeEventListener('scroll', updateSelectionHighlight, true);
      window.removeEventListener('resize', updateSelectionHighlight);
      hover.remove();
      sel.remove();
      tooltip.remove();
      hoverHighlightRef.current = null;
      selectionHighlightRef.current = null;
      tooltipRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

export type { ComponentProp };
