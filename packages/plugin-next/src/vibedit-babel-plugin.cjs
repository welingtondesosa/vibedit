/**
 * Babel plugin that injects data-vibedit-file and data-vibedit-line
 * attributes into every native HTML JSX element during development.
 * This gives Vibedit reliable source-location info without depending
 * on React fiber internals (_debugSource).
 */
const path = require('path');

module.exports = function vibeditSourcePlugin({ types: t }) {
  return {
    name: 'vibedit-source',
    visitor: {
      JSXOpeningElement(nodePath, state) {
        if (process.env.NODE_ENV !== 'development') return;

        const filename = state.filename;
        if (!filename) return;
        if (filename.includes('node_modules')) return;

        // Only inject on native HTML elements (lowercase tag names)
        const nameNode = nodePath.node.name;
        const tagName =
          t.isJSXIdentifier(nameNode) ? nameNode.name :
          t.isJSXMemberExpression(nameNode) ? null : null;

        if (!tagName || tagName[0] !== tagName[0].toLowerCase() || tagName[0] === tagName[0].toUpperCase()) return;
        // Skip if tagName starts with uppercase (React component)
        if (tagName.charAt(0) === tagName.charAt(0).toUpperCase() && tagName.charAt(0) !== tagName.charAt(0).toLowerCase()) return;

        const loc = nodePath.node.loc;
        if (!loc) return;

        const line = loc.start.line;
        const col = loc.start.column;

        // Make path relative to project root (cwd when babel runs)
        const cwd = state.cwd ?? process.cwd();
        const relFile = path.relative(cwd, filename).replace(/\\/g, '/');

        // Check if attributes already exist to avoid duplicates on re-runs
        const existing = nodePath.node.attributes.map((a) =>
          t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) ? a.name.name : null
        );
        if (existing.includes('data-vibedit-file')) return;

        nodePath.node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier('data-vibedit-file'), t.stringLiteral(relFile)),
          t.jsxAttribute(t.jsxIdentifier('data-vibedit-line'), t.stringLiteral(String(line))),
          t.jsxAttribute(t.jsxIdentifier('data-vibedit-col'), t.stringLiteral(String(col)))
        );
      },
    },
  };
};
