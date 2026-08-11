import preset from 'ts-jest/presets/index.js'

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...preset.defaultsESM,
  // Source uses explicit .js extensions (required for real Node ESM output);
  // map them back to the .ts files on disk.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig-esm.json',
        useESM: true,
      },
    ],
  },
}