import { useElementPicker } from '../hooks/useElementPicker';
import type { SelectedElement } from '../hooks/useElementPicker';

interface ElementPickerProps {
  onSelect: (el: SelectedElement) => void;
  onTextEdit?: (element: Element, oldText: string, newText: string) => void;
  selectedElement?: Element | null;
}

export function ElementPicker({ onSelect, onTextEdit, selectedElement }: ElementPickerProps): null {
  useElementPicker({ active: true, onSelect, onTextEdit, selectedElement });
  return null;
}

export type { SelectedElement };
