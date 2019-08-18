// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  globals: {
    FileManager: 'readonly',
    Safari: 'readonly',
    Script: 'readonly',
    args: 'readonly',
    importModule: 'readonly',
    config: 'readonly',
    Alert: 'readonly',
    Request: 'readonly',
    QuickLook: 'readonly',
    Notification: 'readonly',
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    importModule: true,
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
  },
};
