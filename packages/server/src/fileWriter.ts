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
import * as crypto from 'crypto';
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

  async applyChange(change: Change): Promise<Record<string, unknown> | undefined> {
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
        return await this.applyCssChange(filePath, change);
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
    return undefined;
  }

  private async applyCssChange(filePath: string, change: CssChange): Promise<Record<string, unknown> | undefined> {
    if (filePath.endsWith('.html')) {
      await this.applyCssChangeHtml(filePath, change);
      return;
    }

    const bp = change.breakpoint ?? 'all';
    if (bp !== 'all') {
      return await this.applyCssChangeJsxBreakpoint(filePath, change);
    }

    const { project, sourceFile } = getOrCreateProject(filePath);
    const element = findJsxElementAtPosition(sourceFile, change.line, change.column);

    if (!element) {
      throw new Error(`No JSX element found at ${change.file}:${change.line}:${change.column}`);
    }

    setStyleOnElement(sourceFile, element, change.property, change.value);
    await this.saveFile(filePath, sourceFile.getFullText());
    project.removeSourceFile(sourceFile);
    return undefined;
  }

  private async applyCssChangeJsxBreakpoint(filePath: string, change: CssChange): Promise<Record<string, unknown>> {
    const vid = crypto.createHash('sha1')
      .update(`${filePath}:${change.line}:${change.column}`)
      .digest('hex').slice(0, 8);
    const className = `vbe-${vid}`;
    const cssProp = change.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    const mediaQuery = change.breakpoint === 'mobile'
      ? '@media (max-width: 767px)'
      : '@media (min-width: 1024px)';

    // 1. Add className to the JSX element
    const { project, sourceFile } = getOrCreateProject(filePath);
    const element = findJsxElementAtPosition(sourceFile, change.line, change.column);

    if (element) {
      const { SyntaxKind } = await import('ts-morph');
      const openingEl = element.getKind() === SyntaxKind.JsxElement
        ? (element as import('ts-morph').JsxElement).getOpeningElement()
        : (element as import('ts-morph').JsxSelfClosingElement);

      const classAttr = (openingEl as import('ts-morph').JsxOpeningElement)
        .getAttribute('className') as import('ts-morph').JsxAttribute | undefined;

      if (!classAttr) {
        (openingEl as import('ts-morph').JsxOpeningElement)
          .addAttribute({ name: 'className', initializer: `"${className}"` });
      } else {
        const init = classAttr.getInitializer();
        const text = init?.getText() ?? '""';
        if (!text.includes(className)) {
          if (text.startsWith('"') || text.startsWith("'")) {
            const inner = text.slice(1, -1);
            classAttr.setInitializer(`"${inner} ${className}"`);
          } else {
            // Expression like {styles.foo} → {`${styles.foo} vbe-xxxx`}
            const inner = text.slice(1, -1);
            classAttr.setInitializer(`{\`${inner} ${className}\`}`);
          }
        }
      }

      await this.saveFile(filePath, sourceFile.getFullText());
    }
    project.removeSourceFile(sourceFile);

    // 2. Write/update vibedit-responsive.css
    const srcDir = path.join(this.config.projectRoot, 'src');
    const cssDir = fs.existsSync(srcDir) ? srcDir : this.config.projectRoot;
    const cssFile = path.join(cssDir, 'vibedit-responsive.css');
    const firstImport = !fs.existsSync(cssFile);

    let cssContent = firstImport
      ? '/* Vibedit responsive overrides — generated automatically */\n\n'
      : fs.readFileSync(cssFile, 'utf-8');

    const rule = `  .${className} { ${cssProp}: ${change.value}; }`;
    const mediaRe = new RegExp(
      `(${mediaQuery.replace(/[()]/g, '\\$&')}\\s*\\{)([\\s\\S]*?)(\\n\\})`,
      'g'
    );
    if (mediaRe.test(cssContent)) {
      cssContent = cssContent.replace(mediaRe, (_, open, body, close) => {
        const classRe = new RegExp(`\\.${className}\\s*\\{[^}]*\\}`, 'g');
        if (classRe.test(body)) return open + body.replace(classRe, rule) + close;
        return open + body + `\n${rule}` + close;
      });
    } else {
      cssContent += `${mediaQuery} {\n${rule}\n}\n`;
    }

    fs.writeFileSync(cssFile, cssContent, 'utf-8');

    // 3. Auto-import the CSS file in the project entry point (first time only)
    if (firstImport) {
      const entryPoints = [
        'src/main.tsx', 'src/main.ts', 'src/main.jsx', 'src/main.js',
        'src/index.tsx', 'src/index.ts',
        'pages/_app.tsx', 'pages/_app.jsx', 'pages/_app.js',
        'app/layout.tsx', 'app/layout.jsx', 'app/layout.js',
      ];
      for (const rel of entryPoints) {
        const entryPath = path.join(this.config.projectRoot, rel);
        if (!fs.existsSync(entryPath)) continue;
        const content = fs.readFileSync(entryPath, 'utf-8');
        if (!content.includes('vibedit-responsive.css')) {
          let relCss = path.relative(path.dirname(entryPath), cssFile).replace(/\\/g, '/');
          if (!relCss.startsWith('.')) relCss = `./${relCss}`;
          const importLine = rel.endsWith('.css')
            ? `@import '${relCss}';\n`
            : `import '${relCss}';\n`;
          fs.writeFileSync(entryPath, importLine + content, 'utf-8');
        }
        break;
      }
    }

    return { vid, cssFile, firstImport };
  }

  private async applyCssChangeHtml(filePath: string, change: CssChange): Promise<void> {
    const breakpoint = change.breakpoint ?? 'all';
    const cssProp = change.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const targetLine = change.line - 1;
    const targetCol = change.column ?? 0;

    // Find the target HTML tag near the specified line/column
    let foundIdx = -1;
    let best: { index: number; full: string; attrs: string } | null = null;

    outer: for (let delta = 0; delta <= 5; delta++) {
      for (const offset of delta === 0 ? [0] : [delta, -delta]) {
        const idx = targetLine + offset;
        if (idx < 0 || idx >= lines.length) continue;
        const lineTagRe = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g;
        const tagMatches: { index: number; full: string; attrs: string }[] = [];
        let tm: RegExpExecArray | null;
        while ((tm = lineTagRe.exec(lines[idx])) !== null) {
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

    if (breakpoint === 'all') {
      // Inline style — current behavior
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
    } else {
      // Breakpoint-specific: inject/update <style id="vibedit-responsive"> in <head>
      // Assign a stable data-vid identifier to the element
      const vidHash = crypto
        .createHash('sha1')
        .update(`${filePath}:${change.line}:${change.column}`)
        .digest('hex')
        .slice(0, 8);

      const vidAttrRe = /data-vid="([^"]*)"/;
      if (!vidAttrRe.test(best.attrs)) {
        const newTag = best.full.replace(/>$/, ` data-vid="${vidHash}">`);
        lines[foundIdx] = lines[foundIdx].replace(best.full, newTag);
      }

      const mediaQuery = breakpoint === 'mobile'
        ? '@media (max-width: 767px)'
        : '@media (min-width: 1024px)';
      const selector = `[data-vid="${vidHash}"]`;
      const rule = `  ${selector} { ${cssProp}: ${change.value}; }`;
      const mediaBlock = `${mediaQuery} {\n${rule}\n}`;

      const html = lines.join('\n');
      const styleTagRe = /<style id="vibedit-responsive">([\s\S]*?)<\/style>/;
      const existingMatch = styleTagRe.exec(html);

      let updatedHtml: string;
      if (existingMatch) {
        let existing = existingMatch[1];
        // Update or add the rule inside the existing media block
        const mediaBlockRe = new RegExp(
          `(${mediaQuery.replace(/[()]/g, '\\$&')}\\s*\\{)([\\s\\S]*?)(\\})`,
          'g'
        );
        if (mediaBlockRe.test(existing)) {
          existing = existing.replace(mediaBlockRe, (_, open, body, close) => {
            const propRe = new RegExp(`${selector}\\s*\\{[^}]*${cssProp}\\s*:[^;}]*;?\\s*\\}`, 'g');
            if (propRe.test(body)) {
              return open + body.replace(propRe, rule) + close;
            }
            return open + body + `\n  ${rule}` + close;
          });
        } else {
          existing = existing.trimEnd() + `\n${mediaBlock}\n`;
        }
        updatedHtml = html.replace(styleTagRe, `<style id="vibedit-responsive">${existing}</style>`);
      } else {
        const styleTag = `<style id="vibedit-responsive">\n${mediaBlock}\n</style>`;
        updatedHtml = html.replace('</head>', `${styleTag}\n</head>`);
      }

      fs.writeFileSync(filePath, updatedHtml, 'utf-8');
      return;
    }

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
