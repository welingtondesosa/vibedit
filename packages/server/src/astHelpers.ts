import {
  Project,
  SourceFile,
  JsxElement,
  JsxSelfClosingElement,
  JsxOpeningElement,
  JsxAttribute,
  JsxExpression,
  ObjectLiteralExpression,
  StringLiteral,
  JsxText,
  SyntaxKind,
} from 'ts-morph';

export function getOrCreateProject(filePath: string): { project: Project; sourceFile: SourceFile } {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 4, // JsxEmit.ReactJSX
    },
  });

  const sourceFile = project.addSourceFileAtPath(filePath);
  return { project, sourceFile };
}

export function findJsxElementAtPosition(
  sourceFile: SourceFile,
  line: number,
  _column: number
): JsxElement | JsxSelfClosingElement | null {
  // Find the smallest (innermost) JSX element whose opening tag starts on `line`.
  // Line-based search is more robust than position-based because column encoding
  // varies between Babel (0-indexed) and _debugSource (1-indexed).
  let found: JsxElement | JsxSelfClosingElement | null = null;
  let foundSize = Infinity;

  sourceFile.forEachDescendant((node) => {
    if (
      node.getKind() === SyntaxKind.JsxElement ||
      node.getKind() === SyntaxKind.JsxSelfClosingElement
    ) {
      const startLine = sourceFile.getLineAndColumnAtPos(node.getStart()).line;
      if (startLine === line) {
        const size = node.getEnd() - node.getStart();
        if (size < foundSize) {
          foundSize = size;
          found = node as JsxElement | JsxSelfClosingElement;
        }
      }
    }
  });

  // Fallback: if nothing found exactly on that line, find the element that
  // CONTAINS the line (i.e. the line is inside the element's range).
  if (!found) {
    sourceFile.forEachDescendant((node) => {
      if (
        node.getKind() === SyntaxKind.JsxElement ||
        node.getKind() === SyntaxKind.JsxSelfClosingElement
      ) {
        const startLine = sourceFile.getLineAndColumnAtPos(node.getStart()).line;
        const endLine = sourceFile.getLineAndColumnAtPos(node.getEnd()).line;
        if (startLine <= line && endLine >= line) {
          const size = node.getEnd() - node.getStart();
          if (size < foundSize) {
            foundSize = size;
            found = node as JsxElement | JsxSelfClosingElement;
          }
        }
      }
    });
  }

  return found;
}

export function setStyleOnElement(
  _sourceFile: SourceFile,
  element: JsxElement | JsxSelfClosingElement,
  property: string,
  value: string
): void {
  const openingElement =
    element.getKind() === SyntaxKind.JsxElement
      ? (element as JsxElement).getOpeningElement()
      : (element as JsxSelfClosingElement);

  // Convert CSS property to camelCase (e.g. font-size → fontSize)
  const camelProp = property.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const valueExpr = `'${value}'`;

  const styleAttr = (openingElement as JsxOpeningElement).getAttribute('style') as
    | JsxAttribute
    | undefined;

  if (styleAttr) {
    const initializer = styleAttr.getInitializer();
    if (initializer?.getKind() === SyntaxKind.JsxExpression) {
      const expr = (initializer as JsxExpression).getExpression();
      if (expr?.getKind() === SyntaxKind.ObjectLiteralExpression) {
        // Navigate the AST directly — no string parsing, preserves complex values
        const obj = expr as ObjectLiteralExpression;
        const existingProp = obj.getProperty(camelProp);
        if (existingProp) {
          existingProp.replaceWithText(`${camelProp}: ${valueExpr}`);
        } else {
          obj.addPropertyAssignment({ name: camelProp, initializer: valueExpr });
        }
        return;
      }
    }
    // Fallback: replace entire initializer (e.g. style is a variable reference)
    styleAttr.setInitializer(`{{ ${camelProp}: ${valueExpr} }}`);
  } else {
    // No style attribute yet — add one
    (openingElement as JsxOpeningElement).addAttribute({
      name: 'style',
      initializer: `{{ ${camelProp}: ${valueExpr} }}`,
    });
  }
}

export function replaceTextContent(
  sourceFile: SourceFile,
  line: number,
  _column: number,
  oldText: string,
  newText: string
): boolean {
  const trimmedOld = oldText.trim();

  // Collect all candidate nodes with their distance to the target line.
  // We prefer: exact line match > nearest JsxText > nearest StringLiteral
  interface Candidate {
    kind: 'jsx' | 'str';
    node: JsxText | StringLiteral;
    distance: number;
  }
  const candidates: Candidate[] = [];

  sourceFile.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.JsxText) {
      const jsxText = node as JsxText;
      const nodeText = jsxText.getText().trim();
      if (nodeText.includes(trimmedOld)) {
        const nodeLine = sourceFile.getLineAndColumnAtPos(jsxText.getStart()).line;
        candidates.push({ kind: 'jsx', node: jsxText, distance: Math.abs(nodeLine - line) });
      }
    } else if (node.getKind() === SyntaxKind.StringLiteral) {
      const strNode = node as StringLiteral;
      if (strNode.getLiteralText() === trimmedOld) {
        const nodeLine = sourceFile.getLineAndColumnAtPos(strNode.getStart()).line;
        candidates.push({ kind: 'str', node: strNode, distance: Math.abs(nodeLine - line) });
      }
    }
  });

  if (candidates.length === 0) return false;

  // Pick the closest candidate; prefer JsxText over StringLiteral on equal distance.
  // Only consider nodes within 5 lines to avoid accidentally editing unrelated constants.
  candidates.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.kind === 'jsx' ? -1 : 1;
  });

  // Within 5 lines: single targeted replacement
  const nearby = candidates.filter((c) => c.distance <= 5);
  if (nearby.length > 0) {
    const best = nearby[0];
    if (best.kind === 'jsx') {
      const jsxText = best.node as JsxText;
      jsxText.replaceWithText(jsxText.getText().replace(trimmedOld, newText));
    } else {
      (best.node as StringLiteral).setLiteralValue(newText);
    }
    return true;
  }

  // Text comes from a variable/translation object — replace ALL matching literals.
  // This updates every language entry that shares the same value (e.g. COPY object).
  let replaced = false;
  for (const c of candidates) {
    if (c.kind === 'jsx') {
      const jsxText = c.node as JsxText;
      jsxText.replaceWithText(jsxText.getText().replace(trimmedOld, newText));
    } else {
      (c.node as StringLiteral).setLiteralValue(newText);
    }
    replaced = true;
  }
  return replaced;
}

export function reorderChildren(
  sourceFile: SourceFile,
  parentLine: number,
  parentColumn: number,
  fromIndex: number,
  toIndex: number
): boolean {
  const element = findJsxElementAtPosition(sourceFile, parentLine, parentColumn);
  if (!element || element.getKind() !== SyntaxKind.JsxElement) return false;

  const jsxElement = element as JsxElement;
  const children = jsxElement
    .getJsxChildren()
    .filter(
      (c) =>
        c.getKind() === SyntaxKind.JsxElement ||
        c.getKind() === SyntaxKind.JsxSelfClosingElement
    );

  if (fromIndex < 0 || toIndex < 0 || fromIndex >= children.length || toIndex >= children.length) {
    return false;
  }

  const childTexts = children.map((c) => c.getText());
  const [moved] = childTexts.splice(fromIndex, 1);
  childTexts.splice(toIndex, 0, moved);

  children.forEach((child, i) => {
    child.replaceWithText(childTexts[i]);
  });

  return true;
}
