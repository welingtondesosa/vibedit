import { toCamelCase } from './cssParser';

// ── Tailwind value maps ──────────────────────────────────────────────────────

const SPACING: Record<string, string> = {
  '0px': '0', '1px': 'px', '2px': '0.5', '4px': '1', '6px': '1.5',
  '8px': '2', '10px': '2.5', '12px': '3', '14px': '3.5', '16px': '4',
  '20px': '5', '24px': '6', '28px': '7', '32px': '8', '36px': '9',
  '40px': '10', '44px': '11', '48px': '12', '56px': '14', '64px': '16',
  '80px': '20', '96px': '24',
};

const SPACING_PREFIX: Record<string, string> = {
  'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl',
  'margin-top': 'mt', 'margin-right': 'mr', 'margin-bottom': 'mb', 'margin-left': 'ml',
  'gap': 'gap',
};

const FONT_SIZE: Record<string, string> = {
  '12px': 'text-xs', '14px': 'text-sm', '16px': 'text-base', '18px': 'text-lg',
  '20px': 'text-xl', '24px': 'text-2xl', '30px': 'text-3xl', '36px': 'text-4xl',
  '48px': 'text-5xl', '60px': 'text-6xl', '72px': 'text-7xl', '96px': 'text-8xl',
};

const FONT_WEIGHT: Record<string, string> = {
  '100': 'font-thin', '200': 'font-extralight', '300': 'font-light',
  '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold',
  '700': 'font-bold', '800': 'font-extrabold', '900': 'font-black',
};

const BORDER_RADIUS: Record<string, string> = {
  '0px': 'rounded-none', '2px': 'rounded-sm', '4px': 'rounded',
  '6px': 'rounded-md', '8px': 'rounded-lg', '12px': 'rounded-xl',
  '16px': 'rounded-2xl', '24px': 'rounded-3xl',
};

const TEXT_ALIGN: Record<string, string> = {
  'left': 'text-left', 'center': 'text-center', 'right': 'text-right', 'justify': 'text-justify',
};

const DISPLAY: Record<string, string> = {
  'block': 'block', 'flex': 'flex', 'grid': 'grid',
  'inline': 'inline', 'inline-block': 'inline-block', 'none': 'hidden',
};

const FLEX_DIR: Record<string, string> = {
  'row': 'flex-row', 'column': 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse',
};

const JUSTIFY: Record<string, string> = {
  'flex-start': 'justify-start', 'flex-end': 'justify-end', 'center': 'justify-center',
  'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly',
};

const ALIGN: Record<string, string> = {
  'flex-start': 'items-start', 'flex-end': 'items-end', 'center': 'items-center',
  'stretch': 'items-stretch', 'baseline': 'items-baseline',
};

const BORDER_STYLE: Record<string, string> = {
  'none': 'border-none', 'solid': 'border-solid', 'dashed': 'border-dashed',
  'dotted': 'border-dotted', 'double': 'border-double',
};

function cssToTwClass(property: string, value: string, twColorTokens: Record<string, string>): string | null {
  if (SPACING_PREFIX[property] && SPACING[value]) {
    return `${SPACING_PREFIX[property]}-${SPACING[value]}`;
  }

  const hex = value.toLowerCase();
  if (property === 'color' && twColorTokens[hex]) return `text-${twColorTokens[hex]}`;
  if (property === 'background-color' && twColorTokens[hex]) return `bg-${twColorTokens[hex]}`;
  if (property === 'border-color' && twColorTokens[hex]) return `border-${twColorTokens[hex]}`;

  if (property === 'font-size') return FONT_SIZE[value] ?? null;
  if (property === 'font-weight') return FONT_WEIGHT[value] ?? null;
  if (property === 'border-radius') return BORDER_RADIUS[value] ?? null;
  if (property === 'text-align') return TEXT_ALIGN[value] ?? null;
  if (property === 'display') return DISPLAY[value] ?? null;
  if (property === 'flex-direction') return FLEX_DIR[value] ?? null;
  if (property === 'justify-content') return JUSTIFY[value] ?? null;
  if (property === 'align-items') return ALIGN[value] ?? null;
  if (property === 'border-style') return BORDER_STYLE[value] ?? null;
  if (property === 'opacity' && value === '1') return null;
  if (property === 'opacity') return `opacity-${Math.round(parseFloat(value) * 100)}`;
  if (property === 'border-width') {
    if (value === '0px') return 'border-0';
    if (value === '1px') return 'border';
    if (value === '2px') return 'border-2';
    if (value === '4px') return 'border-4';
    if (value === '8px') return 'border-8';
  }

  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function formatAsCSS(styles: Record<string, string>, selector = '.element'): string {
  const entries = Object.entries(styles).filter(([, v]) => v);
  if (entries.length === 0) return '';
  const lines = entries.map(([prop, val]) => `  ${prop}: ${val};`).join('\n');
  return `${selector} {\n${lines}\n}`;
}

export function formatAsReact(styles: Record<string, string>): string {
  const entries = Object.entries(styles).filter(([, v]) => v);
  if (entries.length === 0) return 'style={{}}';
  const lines = entries.map(([prop, val]) => {
    const camel = toCamelCase(prop);
    const isNumeric = /^-?[\d.]+$/.test(val);
    return `  ${camel}: ${isNumeric ? val : `'${val}'`},`;
  });
  return `style={{\n${lines.join('\n')}\n}}`;
}

export function formatAsTailwind(styles: Record<string, string>, twColorTokens: Record<string, string>): string {
  const classes: string[] = [];
  const unmapped: string[] = [];

  for (const [prop, val] of Object.entries(styles)) {
    if (!val) continue;
    const tw = cssToTwClass(prop, val, twColorTokens);
    if (tw) classes.push(tw);
    else unmapped.push(`/* ${prop}: ${val} */`);
  }

  let result = classes.length > 0 ? `className="${classes.join(' ')}"` : '';
  if (unmapped.length > 0) {
    result += (result ? '\n\n' : '') + '/* No Tailwind match:\n' + unmapped.join('\n') + '\n*/';
  }
  return result || '/* No styles */';
}
