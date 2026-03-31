/**
 * Reads React's internal fiber from a DOM node.
 * Works with React 16+ (both __reactFiber and __reactInternalInstance).
 */

interface ReactFiber {
  type: string | ((...args: unknown[]) => unknown) | { displayName?: string; name?: string };
  _debugSource?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  };
  return?: ReactFiber;
  stateNode?: Element;
  memoizedProps?: Record<string, unknown>;
}

function getFiberKey(element: Element): string | null {
  const keys = Object.keys(element);
  const fiberKey = keys.find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  );
  return fiberKey ?? null;
}

export function getFiberFromElement(element: Element): ReactFiber | null {
  const key = getFiberKey(element);
  if (!key) return null;
  return (element as unknown as Record<string, ReactFiber>)[key] ?? null;
}

export function getComponentName(element: Element): string {
  const fiber = getFiberFromElement(element);
  if (!fiber) return element.tagName.toLowerCase();

  // Walk up the fiber tree to find the nearest named component
  let current: ReactFiber | undefined = fiber;
  while (current) {
    const { type } = current;
    if (typeof type === 'function') {
      return type.displayName ?? type.name ?? 'Anonymous';
    }
    if (typeof type === 'object' && type !== null) {
      return (type as { displayName?: string; name?: string }).displayName ?? 'Component';
    }
    current = current.return;
  }

  return element.tagName.toLowerCase();
}

export interface SourceInfo {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

export function getSourceInfo(element: Element): SourceInfo | null {
  // Primary: data attributes injected by vibedit-babel-plugin (reliable, works with SWC and Babel)
  const file = element.getAttribute('data-vibedit-file');
  const line = element.getAttribute('data-vibedit-line');
  if (file && line) {
    return {
      fileName: file,
      lineNumber: parseInt(line, 10),
      columnNumber: parseInt(element.getAttribute('data-vibedit-col') ?? '0', 10),
    };
  }

  // Fallback: walk up the DOM to find an ancestor with source attributes
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.body) {
    const aFile = ancestor.getAttribute('data-vibedit-file');
    const aLine = ancestor.getAttribute('data-vibedit-line');
    if (aFile && aLine) {
      return {
        fileName: aFile,
        lineNumber: parseInt(aLine, 10),
        columnNumber: parseInt(ancestor.getAttribute('data-vibedit-col') ?? '0', 10),
      };
    }
    ancestor = ancestor.parentElement;
  }

  // Last resort: React fiber _debugSource
  const fiber = getFiberFromElement(element);
  if (!fiber) return null;
  let current: ReactFiber | undefined = fiber;
  while (current) {
    if (current._debugSource) {
      return {
        fileName: current._debugSource.fileName,
        lineNumber: current._debugSource.lineNumber,
        columnNumber: current._debugSource.columnNumber,
      };
    }
    current = current.return;
  }

  return null;
}

// ── Props Inspector ──────────────────────────────────────────────────────────

export type PropEditableType = 'string' | 'number' | 'boolean' | 'readonly';

export interface ComponentProp {
  name: string;
  value: unknown;
  editableType: PropEditableType;
}

/**
 * Returns the props of the nearest React component fiber above the DOM element.
 * Filters out `children` and internal React keys.
 */
export function getComponentProps(element: Element): ComponentProp[] {
  const fiber = getFiberFromElement(element);
  if (!fiber) return [];

  // Walk up to find the nearest component fiber (type is a function)
  let current: ReactFiber | undefined = fiber.return;
  while (current) {
    if (typeof current.type === 'function') {
      const props = current.memoizedProps ?? {};
      return Object.entries(props)
        .filter(([key]) => key !== 'children' && !key.startsWith('__'))
        .map(([name, value]) => {
          const editableType: PropEditableType =
            typeof value === 'string'
              ? 'string'
              : typeof value === 'number'
                ? 'number'
                : typeof value === 'boolean'
                  ? 'boolean'
                  : 'readonly';
          return { name, value, editableType };
        });
    }
    current = current.return;
  }

  return [];
}
