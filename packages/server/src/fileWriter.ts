import * as fs from 'fs';
import * as path from 'path';
import { format } from 'prettier';
import { BackupManager } from './backup.js';
import {
  getOrCreateProject,
  findJsxElementAtPosition,
  setStyleOnElement,
  replaceTextContent,
  reorderChildren,
} from './astHelpers.js';
import type {
  Change,
  CssChange,
  TextChange,
  PropChange,
  ReorderChange,
  GlobalTextChange,
  UndoEntry,
  VibeditConfig,
} from './types.js';

export class FileWriter {
  private backup: BackupManager;
  private undoStack: UndoEntry[] = [];
  private config: VibeditConfig;

  constructor(config: VibeditConfig) {
    this.config = config;
    this.backup = new BackupManager(config.projectRoot, config.backupDir);
  }

  async applyChange(change: Change): Promise<void> {
    if (change.type === 'undo') {
      await this.undo();
      return;
    }

    if (change.type === 'global-text') {
      await this.applyGlobalTextChange(change);
      return;
    }

    const filePath = this.resolveFilePath(change.file);
    this.validateFilePath(filePath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Save undo state before modifying
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    this.backup.backup(filePath);
    this.pushUndo(filePath, originalContent);

    switch (change.type) {
      case 'css':
        await this.applyCssChange(filePath, change);
        break;
      case 'text':
        await this.applyTextChange(filePath, change);
        break;
      case 'prop':
        await this.applyPropChange(filePath, change);
        break;
      case 'reorder':
        await this.applyReorderChange(filePath, change);
        break;
    }
  }

  private async applyCssChange(filePath: string, change: CssChange): Promise<void> {
    if (filePath.endsWith('.html')) {
      await this.applyCssChangeHtml(filePath, change);
      return;
    }
    const { project, sourceFile } = getOrCreateProject(filePath);
    const element = findJsxElementAtPosition(sourceFile, change.line, change.column);

    if (!element) {
      throw new Error(`No JSX element found at ${change.file}:${change.line}:${change.column}`);
    }

    setStyleOnElement(sourceFile, element, change.property, change.value);
    await this.saveFile(filePath, sourceFile.getFullText());
    project.removeSourceFile(sourceFile);
  }

  private async applyCssChangeHtml(filePath: string, change: CssChange): Promise<void> {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const targetLine = change.line - 1; // convert to 0-indexed
    const targetCol = change.column ?? 0;
    const cssProp = change.property.replace(/([A-Z])/g, '-$1').toLowerCase();

    let foundIdx = -1;
    let best: { index: number; full: string; attrs: string } | null = null;

    outer: for (let delta = 0; delta <= 5; delta++) {
      for (const offset of delta === 0 ? [0] : [delta, -delta]) {
        const idx = targetLine + offset;
        if (idx < 0 || idx >= lines.length) continue;
        const lineContent = lines[idx];

        const lineTagRe = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g;
        const tagMatches: { index: number; full: string; attrs: string }[] = [];
        let tm: RegExpExecArray | null;
        while ((tm = lineTagRe.exec(lineContent)) !== null) {
          tagMatches.push({ index: tm.index, full: tm[0], attrs: tm[2] ?? '' });
        }
        if (tagMatches.length === 0) continue;

        let bestMatch = tagMatches[0];
        let bestDist = Math.abs(bestMatch.index - targetCol);
        for (const t of tagMatches.slice(1)) {
          const dist = Math.abs(t.index - targetCol);
          if (dist < bestDist) { bestDist = dist; bestMatch = t; }
        }
        foundIdx = idx;
        best = bestMatch;
        break outer;
      }
    }

    if (!best || foundIdx === -1) {
      throw new Error(`No HTML tag found near ${change.file}:${change.line}`);
    }

    const styleRe = /style="([^"]*)"/;
    let newTag: string;
    if (styleRe.test(best.attrs)) {
      newTag = best.full.replace(styleRe, (_, existing) => {
        const propRe = new RegExp(`${cssProp}\\s*:[^;]*;?\\s*`);
        const updated = propRe.test(existing)
          ? existing.replace(propRe, `${cssProp}: ${change.value}; `)
          : `${existing.trimEnd()} ${cssProp}: ${change.value};`;
        return `style="${updated.trim()}"`;
      });
    } else {
      newTag = best.full.replace(/>$/, ` style="${cssProp}: ${change.value};">`);
    }

    lines[foundIdx] = lines[foundIdx].replace(best.full, newTag);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  private async applyTextChange(filePath: string, change: TextChange): Promise<void> {
    if (filePath.endsWith('.html')) {
      await this.applyTextChangeHtml(filePath, change);
      return;
    }
    const { project, sourceFile } = getOrCreateProject(filePath);
    const replaced = replaceTextContent(
      sourceFile,
      change.line,
      change.column,
      change.oldText,
      change.newText
    );

    if (!replaced) {
      throw new Error(`Text "${change.oldText}" not found at ${change.file}:${change.line}`);
    }

    await this.saveFile(filePath, sourceFile.getFullText());
    project.removeSourceFile(sourceFile);
  }

  private async applyTextChangeHtml(filePath: string, change: TextChange): Promise<void> {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const targetLine = change.line - 1;

    for (let delta = 0; delta <= 10; delta++) {
      for (const offset of delta === 0 ? [0] : [delta, -delta]) {
        const idx = targetLine + offset;
        if (idx < 0 || idx >= lines.length) continue;
        if (lines[idx].includes(change.oldText)) {
          lines[idx] = lines[idx].replace(change.oldText, change.newText);
          fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
          return;
        }
      }
    }

    throw new Error(`Text "${change.oldText}" not found near ${change.file}:${change.line}`);
  }

  private async applyPropChange(filePath: string, change: PropChange): Promise<void> {
    const { project, sourceFile } = getOrCreateProject(filePath);
    const element = findJsxElementAtPosition(sourceFile, change.line, change.column);

    if (!element) {
      throw new Error(`No JSX element found at ${change.file}:${change.line}:${change.column}`);
    }

    // Import JsxOpeningElement/SelfClosing handling
    const { SyntaxKind } = await import('ts-morph');
    const openingElement =
      element.getKind() === SyntaxKind.JsxElement
        ? (element as import('ts-morph').JsxElement).getOpeningElement()
        : (element as import('ts-morph').JsxSelfClosingElement);

    const existingAttr = (openingElement as import('ts-morph').JsxOpeningElement).getAttribute(
      change.propName
    ) as import('ts-morph').JsxAttribute | undefined;

    let initValue: string;
    if (typeof change.propValue === 'string') {
      initValue = `"${change.propValue}"`;
    } else if (typeof change.propValue === 'boolean') {
      initValue = change.propValue ? `{true}` : `{false}`;
    } else {
      initValue = `{${change.propValue}}`;
    }

    if (existingAttr) {
      existingAttr.setInitializer(initValue);
    } else {
      (openingElement as import('ts-morph').JsxOpeningElement).addAttribute({
        name: change.propName,
        initializer: initValue,
      });
    }

    await this.saveFile(filePath, sourceFile.getFullText());
    project.removeSourceFile(sourceFile);
  }

  private async applyReorderChange(filePath: string, change: ReorderChange): Promise<void> {
    const { project, sourceFile } = getOrCreateProject(filePath);
    const reordered = reorderChildren(
      sourceFile,
      change.parentLine,
      change.parentColumn,
      change.fromIndex,
      change.toIndex
    );

    if (!reordered) {
      throw new Error(`Could not reorder children at ${change.file}:${change.parentLine}`);
    }

    await this.saveFile(filePath, sourceFile.getFullText());
    project.removeSourceFile(sourceFile);
  }

  private async saveFile(filePath: string, content: string): Promise<void> {
    let finalContent = content;

    if (this.config.prettier) {
      try {
        finalContent = await format(content, {
          filepath: filePath,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 100,
        });
      } catch {
        // If prettier fails, write without formatting
        finalContent = content;
      }
    }

    fs.writeFileSync(filePath, finalContent, 'utf-8');
  }

  private pushUndo(filePath: string, originalContent: string): void {
    const entry: UndoEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: filePath,
      originalContent,
      timestamp: Date.now(),
    };

    this.undoStack.push(entry);

    // Trim to undoLimit
    if (this.undoStack.length > this.config.undoLimit) {
      this.undoStack.shift();
    }
  }

  private async undo(): Promise<void> {
    const entry = this.undoStack.pop();
    if (!entry) {
      throw new Error('Nothing to undo');
    }

    fs.writeFileSync(entry.file, entry.originalContent, 'utf-8');
  }

  private async applyGlobalTextChange(change: GlobalTextChange): Promise<void> {
    const SKIP_DIRS = new Set([
      'node_modules', 'dist', '.next', '.git', 'build', '.cache',
      '.turbo', 'coverage', '.vibedit-backup', 'out', '.output',
    ]);
    const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|html)$/;

    // Collect all candidate files under projectRoot
    const candidates: string[] = [];
    const walk = (dir: string): void => {
      let entries: fs.Dirent[];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
        } else if (SOURCE_EXT.test(entry.name)) {
          candidates.push(path.join(dir, entry.name));
        }
      }
    };
    walk(this.config.projectRoot);

    // First pass: find which files actually contain the text as a string literal
    const affected: string[] = [];
    for (const filePath of candidates) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (!content.includes(change.oldText)) continue;

      if (filePath.endsWith('.json') || filePath.endsWith('.html')) {
        affected.push(filePath);
      } else {
        // Quick check via ts-morph that it's actually a StringLiteral
        const { project, sourceFile } = getOrCreateProject(filePath);
        const { SyntaxKind } = await import('ts-morph');
        let found = false;
        sourceFile.forEachDescendant((node) => {
          if (found) return;
          if (node.getKind() === SyntaxKind.StringLiteral) {
            const lit = node as import('ts-morph').StringLiteral;
            if (lit.getLiteralText() === change.oldText) found = true;
          }
        });
        project.removeSourceFile(sourceFile);
        if (found) affected.push(filePath);
      }
    }

    if (affected.length === 0) {
      throw new Error(`"${change.oldText}" not found as a string literal in any source file`);
    }

    // Backup all affected files, then replace
    for (const filePath of affected) {
      const originalContent = fs.readFileSync(filePath, 'utf-8');
      this.backup.backup(filePath);
      this.pushUndo(filePath, originalContent);

      if (filePath.endsWith('.json')) {
        // Wrap in quotes to match JSON string values
        const escaped = change.oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const updated = originalContent.replace(
          new RegExp(`"${escaped}"`, 'g'),
          `"${change.newText}"`
        );
        fs.writeFileSync(filePath, updated, 'utf-8');
      } else if (filePath.endsWith('.html')) {
        // Plain text replacement for HTML
        const updated = originalContent.split(change.oldText).join(change.newText);
        fs.writeFileSync(filePath, updated, 'utf-8');
      } else {
        const { project, sourceFile } = getOrCreateProject(filePath);
        const { SyntaxKind } = await import('ts-morph');
        sourceFile.forEachDescendant((node) => {
          if (node.getKind() === SyntaxKind.StringLiteral) {
            const lit = node as import('ts-morph').StringLiteral;
            if (lit.getLiteralText() === change.oldText) {
              lit.setLiteralValue(change.newText);
            }
          }
        });
        await this.saveFile(filePath, sourceFile.getFullText());
        project.removeSourceFile(sourceFile);
      }
    }
  }

  private resolveFilePath(filePath: string): string {
    // Absolute paths (injected by vibedit-babel-plugin) are used directly.
    // Relative paths are resolved against projectRoot (legacy / fallback).
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.config.projectRoot, filePath);
  }

  private validateFilePath(filePath: string): void {
    const resolved = path.resolve(filePath);
    const root = path.resolve(this.config.projectRoot);

    if (!resolved.startsWith(root)) {
      throw new Error(`Path traversal attempt blocked: ${filePath}`);
    }
  }
}
