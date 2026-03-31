export interface VibeditConfig {
  port: number;
  undoLimit: number;
  backupDir: string;
  prettier: boolean;
  projectRoot: string;
}

export type ChangeType = 'css' | 'text' | 'prop' | 'reorder';

export interface CssChange {
  type: 'css';
  file: string;
  line: number;
  column: number;
  property: string;
  value: string;
  componentName: string;
}

export interface TextChange {
  type: 'text';
  file: string;
  line: number;
  column: number;
  oldText: string;
  newText: string;
}

export interface PropChange {
  type: 'prop';
  file: string;
  line: number;
  column: number;
  propName: string;
  propValue: string | number | boolean;
  componentName: string;
}

export interface ReorderChange {
  type: 'reorder';
  file: string;
  parentLine: number;
  parentColumn: number;
  fromIndex: number;
  toIndex: number;
}

export interface UndoChange {
  type: 'undo';
}

export type Change = CssChange | TextChange | PropChange | ReorderChange | UndoChange;

export interface ServerMessage {
  id: string;
  change: Change;
}

export interface ServerResponse {
  id: string;
  success: boolean;
  error?: string;
}

export interface UndoEntry {
  id: string;
  file: string;
  originalContent: string;
  timestamp: number;
}
