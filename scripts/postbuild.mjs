/**
 * Marks each build output with its module system.
 *
 * Node resolves CJS vs ESM per directory, using the nearest package.json "type"
 * field. The root package.json has no "type" (so it defaults to commonjs), which
 * would otherwise cause Node to parse lib/esm/*.js as CommonJS and fail on the
 * `export` statements. Writing a scoped package.json into each output directory
 * is the standard dual-package fixup.
 */
import { writeFileSync } from 'node:fs';

const targets = [
    ['lib/esm/package.json', { type: 'module' }],
    ['lib/cjs/package.json', { type: 'commonjs' }]
];

for (const [path, content] of targets) {
    writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
    console.log(`postbuild: ${path} -> ${JSON.stringify(content)}`);
}
