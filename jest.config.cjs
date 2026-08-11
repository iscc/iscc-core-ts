const preset = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...preset.defaults,
  // Source uses explicit .js extensions (required for real Node ESM output);
  // map them back to the .ts files on disk.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}