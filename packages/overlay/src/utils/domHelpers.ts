export function getRelativePath(absolutePath: string): string {
  // Extract relative path — try to get path from src/ onwards
  const srcIndex = absolutePath.indexOf('/src/');
  if (srcIndex !== -1) return absolutePath.slice(srcIndex + 1);

  const parts = absolutePath.split(/[\\/]/);
  return parts.slice(-2).join('/');
}

export function getComputedStyles(element: Element): Record<string, string> {
  const computed = window.getComputedStyle(element);
  const relevant: Record<string, string> = {};

  const properties = [
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'font-size', 'font-weight', 'line-height', 'letter-spacing', 'font-family',
    'color', 'background-color', 'opacity',
    'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'border-radius', 'border-width', 'border-color', 'border-style',
    'box-shadow',
  ];

  for (const prop of properties) {
    const val = computed.getPropertyValue(prop);
    if (val && val !== 'none' && val !== 'normal' && val !== 'auto') {
      relevant[prop] = val;
    }
  }

  return relevant;
}

export function isVibeditElement(element: Element): boolean {
  return (
    element.closest('[data-vibedit]') !== null ||
    element.hasAttribute('data-vibedit')
  );
}

export function getElementPath(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className && typeof current.className === 'string') {
      const firstClass = current.className.split(' ')[0];
      if (firstClass) selector += `.${firstClass}`;
    }
    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}
