import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { SelectedElement } from '../hooks/useElementPicker';
import type { ComponentProp } from '../utils/reactFiber';
import { toKebabCase } from '../utils/cssParser';
import { getRelativePath } from '../utils/domHelpers';
import { parseColor, rgbToHex } from '../utils/cssParser';
import { findPropSource, getComponentProps } from '../utils/reactFiber';

// ── PRD design tokens (dark) ─────────────────────────────────────────────────
const T = {
  accent: '#1A56DB',
  surface: '#0F172A',
  surface2: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
} as const;

// ── Property definitions ─────────────────────────────────────────────────────

type PropInputType = 'slider' | 'color' | 'select' | 'text';

interface PropDef {
  name: string;
  type: PropInputType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
}

interface GroupDef {
  label: string;
  properties: PropDef[];
}

const GROUPS: GroupDef[] = [
  {
    label: 'Spacing',
    properties: [
      { name: 'padding-top', type: 'slider', min: 0, max: 200, unit: 'px' },
      { name: 'padding-right', type: 'slider', min: 0, max: 200, unit: 'px' },
      { name: 'padding-bottom', type: 'slider', min: 0, max: 200, unit: 'px' },
      { name: 'padding-left', type: 'slider', min: 0, max: 200, unit: 'px' },
      { name: 'margin-top', type: 'slider', min: -100, max: 200, unit: 'px' },
      { name: 'margin-right', type: 'slider', min: -100, max: 200, unit: 'px' },
      { name: 'margin-bottom', type: 'slider', min: -100, max: 200, unit: 'px' },
      { name: 'margin-left', type: 'slider', min: -100, max: 200, unit: 'px' },
    ],
  },
  {
    label: 'Typography',
    properties: [
      { name: 'font-size', type: 'slider', min: 8, max: 96, unit: 'px' },
      {
        name: 'font-weight',
        type: 'select',
        options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      },
      { name: 'line-height', type: 'slider', min: 0, max: 4, step: 0.1, unit: '' },
      { name: 'letter-spacing', type: 'slider', min: -5, max: 20, step: 0.5, unit: 'px' },
      { name: 'color', type: 'color' },
      { name: 'font-family', type: 'text' },
      {
        name: 'text-align',
        type: 'select',
        options: ['left', 'center', 'right', 'justify'],
      },
    ],
  },
  {
    label: 'Background',
    properties: [
      { name: 'background-color', type: 'color' },
      { name: 'opacity', type: 'slider', min: 0, max: 1, step: 0.01, unit: '' },
    ],
  },
  {
    label: 'Layout',
    properties: [
      {
        name: 'display',
        type: 'select',
        options: ['block', 'flex', 'grid', 'inline', 'inline-block', 'none'],
      },
      {
        name: 'flex-direction',
        type: 'select',
        options: ['row', 'column', 'row-reverse', 'column-reverse'],
      },
      {
        name: 'justify-content',
        type: 'select',
        options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
      },
      {
        name: 'align-items',
        type: 'select',
        options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
      },
      { name: 'gap', type: 'slider', min: 0, max: 100, unit: 'px' },
    ],
  },
  {
    label: 'Dimensions',
    properties: [
      { name: 'width', type: 'text' },
      { name: 'height', type: 'text' },
      { name: 'min-width', type: 'text' },
      { name: 'max-width', type: 'text' },
      { name: 'min-height', type: 'text' },
      { name: 'max-height', type: 'text' },
    ],
  },
  {
    label: 'Border',
    properties: [
      { name: 'border-radius', type: 'slider', min: 0, max: 100, unit: 'px' },
      { name: 'border-width', type: 'slider', min: 0, max: 20, unit: 'px' },
      { name: 'border-color', type: 'color' },
      {
        name: 'border-style',
        type: 'select',
        options: ['none', 'solid', 'dashed', 'dotted', 'double'],
      },
    ],
  },
  {
    label: 'Shadow',
    properties: [{ name: 'box-shadow', type: 'text' }],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseNumericValue(value: string): { num: number; unit: string } {
  const match = value.match(/^(-?[\d.]+)(\S*)$/);
  if (match) return { num: parseFloat(match[1]), unit: match[2] };
  return { num: parseFloat(value) || 0, unit: '' };
}

function cssColorToHex(value: string): string {
  const parsed = parseColor(value);
  if (parsed) return rgbToHex(parsed.r, parsed.g, parsed.b);
  if (value.startsWith('#')) return value;
  return '#000000';
}

const labelStyle: React.CSSProperties = {
  flex: '0 0 104px',
  color: '#89B4FA',
  fontSize: '12px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 14px',
  gap: '6px',
};

// ── Slider row ───────────────────────────────────────────────────────────────

interface RowProps {
  def: PropDef;
  value: string;
  saving: boolean;
  onChange: (property: string, value: string) => void;
}

function SliderRow({ def, value, saving, onChange }: RowProps): React.ReactElement {
  const { num, unit } = parseNumericValue(value);
  const displayUnit = unit || def.unit || '';
  const [local, setLocal] = useState(num);

  useEffect(() => {
    const { num: n } = parseNumericValue(value);
    setLocal(n);
  }, [value]);

  const commit = (n: number): void => onChange(def.name, `${n}${displayUnit}`);

  return (
    <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
      <div style={labelStyle} title={def.name}>{def.name}</div>
      <input
        type="range"
        min={def.min ?? 0}
        max={def.max ?? 100}
        step={def.step ?? 1}
        value={local}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          setLocal(n);
          onChange(def.name, `${n}${displayUnit}`);
        }}
        style={{ flex: 1, accentColor: T.accent, cursor: 'pointer', minWidth: 0 }}
      />
      <input
        type="number"
        value={local}
        min={def.min ?? 0}
        max={def.max ?? 100}
        step={def.step ?? 1}
        onChange={(e) => setLocal(parseFloat(e.target.value) || 0)}
        onBlur={(e) => commit(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(local); }}
        style={{
          width: '44px', background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: '4px', color: T.textPrimary, fontSize: '11px',
          padding: '2px 4px', textAlign: 'right', flexShrink: 0,
          fontFamily: 'ui-monospace, monospace',
        }}
      />
      {displayUnit && (
        <span style={{ color: T.textSecondary, fontSize: '11px', flexShrink: 0, minWidth: '14px' }}>
          {displayUnit}
        </span>
      )}
    </div>
  );
}

// ── Color row ────────────────────────────────────────────────────────────────

function ColorRow({ def, value, saving, onChange }: RowProps): React.ReactElement {
  const [local, setLocal] = useState(() => cssColorToHex(value));

  useEffect(() => { setLocal(cssColorToHex(value)); }, [value]);

  return (
    <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
      <div style={labelStyle} title={def.name}>{def.name}</div>
      <input
        type="color"
        value={local}
        onChange={(e) => { setLocal(e.target.value); onChange(def.name, e.target.value); }}
        style={{
          width: '28px', height: '24px', padding: '0 2px', flexShrink: 0,
          border: `1px solid ${T.border}`, borderRadius: '4px',
          background: T.surface2, cursor: 'pointer',
        }}
      />
      <input
        type="text"
        value={local}
        maxLength={7}
        onChange={(e) => {
          setLocal(e.target.value);
          if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(def.name, e.target.value);
        }}
        style={{
          flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: '4px', color: T.textPrimary, fontSize: '12px',
          padding: '3px 6px', minWidth: 0, fontFamily: 'ui-monospace, monospace',
        }}
      />
    </div>
  );
}

// ── Select row ───────────────────────────────────────────────────────────────

function SelectRow({ def, value, saving, onChange }: RowProps): React.ReactElement {
  return (
    <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
      <div style={labelStyle} title={def.name}>{def.name}</div>
      <select
        value={value}
        onChange={(e) => onChange(def.name, e.target.value)}
        style={{
          flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: '4px', color: T.textPrimary, fontSize: '12px',
          padding: '3px 6px', minWidth: 0, cursor: 'pointer',
        }}
      >
        {def.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

// ── Text row ─────────────────────────────────────────────────────────────────

function TextRow({ def, value, saving, onChange }: RowProps): React.ReactElement {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);

  return (
    <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
      <div style={labelStyle} title={def.name}>{def.name}</div>
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onChange(def.name, local); }}
        onKeyDown={(e) => { if (e.key === 'Enter') onChange(def.name, local); }}
        style={{
          flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: '4px', color: T.textPrimary, fontSize: '12px',
          padding: '3px 6px', minWidth: 0, fontFamily: 'ui-monospace, monospace',
        }}
      />
    </div>
  );
}

function PropertyRow(props: RowProps): React.ReactElement {
  switch (props.def.type) {
    case 'slider': return <SliderRow {...props} />;
    case 'color': return <ColorRow {...props} />;
    case 'select': return <SelectRow {...props} />;
    default: return <TextRow {...props} />;
  }
}

// ── CSS Section ──────────────────────────────────────────────────────────────

interface SectionProps {
  group: GroupDef;
  styles: Record<string, string>;
  saving: string | null;
  onChange: (property: string, value: string) => void;
  onRevert: (groupLabel: string) => void;
  originalStyles: Record<string, string>;
}

function CssSection({ group, styles, saving, onChange, onRevert, originalStyles }: SectionProps): React.ReactElement | null {
  const [open, setOpen] = useState(true);
  const visible = group.properties.filter((p) => styles[p.name] !== undefined);
  if (visible.length === 0) return null;

  const hasDiff = visible.some((p) => styles[p.name] !== originalStyles[p.name]);

  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 14px', cursor: 'pointer', userSelect: 'none',
          background: T.surface2,
        }}
      >
        <span style={{ color: T.textSecondary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {group.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasDiff && (
            <button
              onClick={(e) => { e.stopPropagation(); onRevert(group.label); }}
              style={{
                background: 'none', border: `1px solid ${T.border}`, borderRadius: '4px',
                color: T.textSecondary, fontSize: '10px', padding: '1px 6px', cursor: 'pointer',
              }}
            >
              revert
            </button>
          )}
          <span style={{ color: T.textSecondary, fontSize: '11px', transition: 'transform 0.15s', transform: open ? 'none' : 'rotate(-90deg)', display: 'inline-block' }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ paddingTop: '4px', paddingBottom: '6px' }}>
          {visible.map((def) => (
            <PropertyRow
              key={def.name}
              def={def}
              value={styles[def.name] ?? ''}
              saving={saving === def.name}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Props Section ────────────────────────────────────────────────────────────

interface PropsSectionProps {
  props: ComponentProp[];
  onChangeProp: (name: string, value: string | number | boolean) => void;
  saving: string | null;
}

function PropsSection({ props, onChangeProp, saving }: PropsSectionProps): React.ReactElement | null {
  const [open, setOpen] = useState(true);

  // String props are already editable via the CONTENT section — only show boolean/number here.
  const editable = props.filter((p) => p.editableType === 'boolean' || p.editableType === 'number');
  const readonly = props.filter((p) => p.editableType === 'readonly');

  if (editable.length === 0 && readonly.length === 0) return null;

  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 14px', cursor: 'pointer', userSelect: 'none',
          background: T.surface2,
        }}
      >
        <span style={{ color: T.textSecondary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Props
        </span>
        <span style={{ color: T.textSecondary, fontSize: '11px', transition: 'transform 0.15s', transform: open ? 'none' : 'rotate(-90deg)', display: 'inline-block' }}>▾</span>
      </div>
      {open && (
        <div style={{ paddingTop: '4px', paddingBottom: '6px' }}>
          {editable.map((prop) => (
            <EditablePropRow key={prop.name} prop={prop} saving={saving === prop.name} onChangeProp={onChangeProp} />
          ))}
          {readonly.map((prop) => (
            <ReadonlyPropRow key={prop.name} prop={prop} />
          ))}
        </div>
      )}
    </div>
  );
}

interface EditablePropRowProps {
  prop: ComponentProp;
  saving: boolean;
  onChangeProp: (name: string, value: string | number | boolean) => void;
}

function EditablePropRow({ prop, saving, onChangeProp }: EditablePropRowProps): React.ReactElement {
  const [local, setLocal] = useState<string>(() => String(prop.value));
  useEffect(() => { setLocal(String(prop.value)); }, [prop.value]);

  if (prop.editableType === 'boolean') {
    return (
      <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
        <div style={labelStyle} title={prop.name}>{prop.name}</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={prop.value === true}
            onChange={(e) => onChangeProp(prop.name, e.target.checked)}
            style={{ accentColor: T.accent, width: '14px', height: '14px' }}
          />
          <span style={{ color: T.textSecondary, fontSize: '12px' }}>
            {prop.value === true ? 'true' : 'false'}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div style={{ ...rowStyle, opacity: saving ? 0.5 : 1 }}>
      <div style={labelStyle} title={prop.name}>{prop.name}</div>
      <input
        type={prop.editableType === 'number' ? 'number' : 'text'}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (String(prop.value) !== local) {
            const v: string | number = prop.editableType === 'number' ? parseFloat(local) || 0 : local;
            onChangeProp(prop.name, v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v: string | number = prop.editableType === 'number' ? parseFloat(local) || 0 : local;
            onChangeProp(prop.name, v);
          }
        }}
        style={{
          flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
          borderRadius: '4px', color: T.textPrimary, fontSize: '12px',
          padding: '3px 6px', minWidth: 0, fontFamily: 'ui-monospace, monospace',
        }}
      />
    </div>
  );
}

function ReadonlyPropRow({ prop }: { prop: ComponentProp }): React.ReactElement {
  const display = typeof prop.value === 'function'
    ? '[function]'
    : Array.isArray(prop.value)
      ? `[array (${(prop.value as unknown[]).length})]`
      : typeof prop.value === 'object'
        ? '[object]'
        : String(prop.value);

  return (
    <div style={{ ...rowStyle, opacity: 0.5 }}>
      <div style={labelStyle} title={prop.name}>{prop.name}</div>
      <span style={{ flex: 1, color: T.textSecondary, fontSize: '12px', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {display}
      </span>
    </div>
  );
}

// ── EditPanel ────────────────────────────────────────────────────────────────

interface EditPanelProps {
  selected: SelectedElement;
  send: (message: unknown) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

type Breakpoint = 'all' | 'mobile' | 'desktop';

const BREAKPOINTS: { key: Breakpoint; label: string; icon: string }[] = [
  { key: 'all',     label: 'All',     icon: '◻' },
  { key: 'mobile',  label: 'Mobile',  icon: '📱' },
  { key: 'desktop', label: 'Desktop', icon: '🖥' },
];

export function EditPanel({ selected, send, onClose, onToast }: EditPanelProps): React.ReactElement {
  const [localStyles, setLocalStyles] = useState<Record<string, string>>(selected.styles);
  const [originalStyles] = useState<Record<string, string>>(selected.styles);
  const [savingCss, setSavingCss] = useState<string | null>(null);
  const [savingProp, setSavingProp] = useState<string | null>(null);
  const [savingText, setSavingText] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('all');

  // Text content of the selected element (direct text only)
  const elementText = (() => {
    const el = selected.element;
    const parts: string[] = [];
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        parts.push(node.textContent.trim());
      }
    }
    return parts.join(' ').trim();
  })();
  const [localText, setLocalText] = useState(elementText);
  useEffect(() => { setLocalText(elementText); }, [selected.element]);

  const handleTextSave = useCallback(async () => {
    if (!localText || localText === elementText) return;
    if (!selected.sourceFile || !selected.line) {
      onToast('Sin source info para editar texto', 'error');
      return;
    }
    setSavingText(true);

    // 1. Try direct text replacement in the source file
    const result = await send({
      change: {
        type: 'text',
        file: selected.sourceFile,
        line: selected.line,
        column: selected.column,
        oldText: elementText,
        newText: localText,
      },
    });

    if (result.success) {
      setSavingText(false);
      onToast('Texto actualizado', 'success');
      return;
    }

    // 2. Text not found as a literal — it likely comes from a prop expression ({someVar}).
    //    Walk the React fiber tree to find which prop holds this value and where it is passed.
    const propSource = findPropSource(selected.element, elementText);
    if (propSource) {
      // Use TextChange to the parent call site — replaceTextContent finds the
      // StringLiteral directly, no JSX element position lookup needed.
      const propResult = await send({
        change: {
          type: 'text',
          file: propSource.fileName,
          line: propSource.lineNumber,
          column: propSource.columnNumber,
          oldText: elementText,
          newText: localText,
        },
      });
      setSavingText(false);
      if (propResult.success) {
        onToast(`"${propSource.propName}" actualizado`, 'success');
        return;
      }
      // Call site found but text isn't a literal there either — likely i18n. Fall through to global search.
    }

    // 3. Global search: scan all source/translation files in the project for the string literal.
    const globalResult = await send({
      change: { type: 'global-text', oldText: elementText, newText: localText },
    });
    setSavingText(false);
    onToast(
      globalResult.success
        ? 'Texto actualizado en archivo de traducciones'
        : (globalResult.error ?? `"${elementText}" no encontrado en ningún archivo`),
      globalResult.success ? 'success' : 'error'
    );
  }, [localText, elementText, selected, send, onToast]);
  const [panelWidth, setPanelWidth] = useState(320);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(320);

  useEffect(() => { setLocalStyles(selected.styles); }, [selected]);

  // Panel resize
  useEffect(() => {
    const onMove = (e: MouseEvent): void => {
      if (!isDraggingRef.current) return;
      const delta = dragStartXRef.current - e.clientX;
      setPanelWidth(Math.max(280, Math.min(480, dragStartWidthRef.current + delta)));
    };
    const onUp = (): void => {
      isDraggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = 'crosshair';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleCssChange = useCallback(
    async (property: string, value: string): Promise<void> => {
      // Immediate DOM preview
      const el = selected.element as HTMLElement;
      const camelProp = property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      (el.style as unknown as Record<string, string>)[camelProp] = value;
      setLocalStyles((prev) => ({ ...prev, [property]: value }));

      if (!selected.sourceFile || !selected.line) {
        onToast('Sin source info — corre en React dev mode', 'error');
        return;
      }

      setSavingCss(property);
      const result = await send({
        change: {
          type: 'css',
          file: selected.sourceFile,
          line: selected.line,
          column: selected.column,
          property: toKebabCase(property),
          value,
          componentName: selected.componentName,
          breakpoint,
        },
      });
      setSavingCss(null);

      if (result.success) {
        onToast(`${property}: ${value}`, 'success');
      } else {
        onToast(result.error ?? 'Error al aplicar cambio', 'error');
      }
    },
    [selected, send, onToast]
  );

  const handlePropChange = useCallback(
    async (name: string, newValue: string | number | boolean): Promise<void> => {
      if (!selected.sourceFile || !selected.line) {
        onToast('Sin source info para editar props', 'error');
        return;
      }

      // For string props: find where the prop is actually passed in the parent
      // and send a TextChange there (more robust than PropChange + JSX position lookup).
      if (typeof newValue === 'string') {
        const currentProps = getComponentProps(selected.element);
        const currentProp = currentProps.find((p) => p.name === name);
        const oldValue = currentProp?.value;
        if (typeof oldValue === 'string' && oldValue !== newValue) {
          const propSource = findPropSource(selected.element, oldValue);
          if (propSource && propSource.propName === name) {
            setSavingProp(name);
            const result = await send({
              change: {
                type: 'text',
                file: propSource.fileName,
                line: propSource.lineNumber,
                column: propSource.columnNumber,
                oldText: oldValue,
                newText: newValue,
              },
            });
            setSavingProp(null);
            onToast(result.success ? `${name}: ${newValue}` : (result.error ?? 'Error al editar prop'), result.success ? 'success' : 'error');
            return;
          }
        }
      }

      // Fallback for booleans, numbers, or when prop source not found
      setSavingProp(name);
      const result = await send({
        change: {
          type: 'prop',
          file: selected.sourceFile,
          line: selected.line,
          column: selected.column,
          propName: name,
          propValue: newValue,
          componentName: selected.componentName,
        },
      });
      setSavingProp(null);

      if (result.success) {
        onToast(`${name}: ${String(newValue)}`, 'success');
      } else {
        onToast(result.error ?? 'Error al editar prop', 'error');
      }
    },
    [selected, send, onToast]
  );

  const handleRevert = useCallback(
    (groupLabel: string): void => {
      const group = GROUPS.find((g) => g.label === groupLabel);
      if (!group) return;
      group.properties.forEach((def) => {
        if (originalStyles[def.name] !== undefined) {
          const el = selected.element as HTMLElement;
          const camelProp = def.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          (el.style as unknown as Record<string, string>)[camelProp] = '';
          void handleCssChange(def.name, originalStyles[def.name]);
        }
      });
    },
    [originalStyles, selected.element, handleCssChange]
  );

  const relPath = selected.sourceFile ? getRelativePath(selected.sourceFile) : '(sin fuente)';

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0,
        width: `${panelWidth}px`, height: '100vh',
        background: T.surface, color: T.textPrimary, zIndex: 999998,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '13px',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        animation: 'vibedit-slidein 0.2s ease-out',
        overflowY: 'hidden',
      }}
    >
      {/* Resize drag handle */}
      <div
        onMouseDown={(e) => {
          isDraggingRef.current = true;
          dragStartXRef.current = e.clientX;
          dragStartWidthRef.current = panelWidth;
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'ew-resize';
        }}
        style={{
          position: 'absolute', left: 0, top: 0,
          width: '4px', height: '100%',
          cursor: 'ew-resize', zIndex: 1,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexShrink: 0,
          background: T.surface2,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#93C5FD', fontSize: '14px' }}>
            {selected.componentName}
          </div>
          <div
            style={{
              fontSize: '11px', color: T.textSecondary, marginTop: '2px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: `${panelWidth - 100}px`,
            }}
            title={relPath}
          >
            {relPath}{selected.line > 0 && `:${selected.line}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={async () => {
              const result = await send({ change: { type: 'undo' } });
              onToast(result.success ? 'Cambio revertido' : (result.error ?? 'Nada que revertir'), result.success ? 'success' : 'error');
            }}
            style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: '6px', color: T.textSecondary,
              cursor: 'pointer', fontSize: '11px', padding: '3px 8px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
            title="Deshacer último cambio (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: T.textSecondary,
              cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0',
            }}
            title="Cerrar (ESC)"
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ overflowY: 'auto', flex: 1 }}>

        {/* Text content editor — shown when element has direct text */}
        {elementText && (
          <div style={{ borderBottom: `1px solid ${T.border}` }}>
            <div style={{ padding: '9px 14px', background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: T.textSecondary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Content
              </span>
            </div>
            <div style={{ padding: '8px 14px 12px' }}>
              <textarea
                value={localText}
                onChange={(e) => setLocalText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleTextSave(); } }}
                rows={Math.min(4, Math.max(1, localText.split('\n').length))}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: '6px', color: T.textPrimary, fontSize: '13px',
                  padding: '6px 8px', resize: 'vertical', fontFamily: 'inherit',
                  lineHeight: 1.5, opacity: savingText ? 0.5 : 1,
                }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  onClick={() => void handleTextSave()}
                  disabled={savingText || localText === elementText}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: '6px',
                    background: localText !== elementText ? T.accent : T.surface2,
                    border: `1px solid ${localText !== elementText ? T.accent : T.border}`,
                    color: T.textPrimary, fontSize: '12px', cursor: localText !== elementText ? 'pointer' : 'default',
                    opacity: savingText ? 0.5 : 1,
                  }}
                >
                  {savingText ? 'Guardando…' : 'Guardar (Enter)'}
                </button>
                <button
                  onClick={() => setLocalText(elementText)}
                  disabled={localText === elementText}
                  style={{
                    padding: '5px 10px', borderRadius: '6px',
                    background: 'none', border: `1px solid ${T.border}`,
                    color: T.textSecondary, fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Props section (if component has props) */}
        <PropsSection
          props={selected.props}
          onChangeProp={handlePropChange}
          saving={savingProp}
        />

        {/* Breakpoint selector */}
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: '8px 14px', background: T.surface2, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: T.textSecondary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>Breakpoint</span>
          {BREAKPOINTS.map((bp) => (
            <button
              key={bp.key}
              onClick={() => setBreakpoint(bp.key)}
              style={{
                flex: 1, padding: '4px 0', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit',
                background: breakpoint === bp.key ? T.accent : T.surface,
                color: breakpoint === bp.key ? '#fff' : T.textSecondary,
                fontWeight: breakpoint === bp.key ? 700 : 400,
              }}
              title={bp.key === 'mobile' ? '< 768px' : bp.key === 'desktop' ? '≥ 1024px' : 'All screen sizes (inline style)'}
            >
              {bp.icon} {bp.label}
            </button>
          ))}
        </div>

        {/* CSS sections */}
        {GROUPS.map((group) => (
          <CssSection
            key={group.label}
            group={group}
            styles={localStyles}
            saving={savingCss}
            onChange={handleCssChange}
            onRevert={handleRevert}
            originalStyles={originalStyles}
          />
        ))}
      </div>
    </div>
  );
}
