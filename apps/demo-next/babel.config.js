/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  presets: ['next/babel'],
  plugins: [
    process.env.NODE_ENV === 'development' ? './vibedit-babel-plugin.cjs' : null,
  ].filter(Boolean),
};
