#!/usr/bin/env node
/**
 * Makes the exported web build run on older phone browsers, not just current ones: iPhone Safari on iOS 12 and later,
 * Chrome 69+ and Samsung Internet 10+. Metro outputs modern JavaScript (class fields, `??`, `?.`, `||=`), and one
 * unsupported token stops the whole app from starting, so this lowers that syntax in every web bundle with Babel and
 * then checks that each bundle parses as ES2019. Newer runtime methods (Array.prototype.at, Object.hasOwn, ...) are
 * polyfilled by the inline script in src/app/+html.tsx.
 *
 * Usage: node scripts/web-compat.js [dist]   (npm run build:web runs `expo export -p web` and then this)
 */
const fs = require('node:fs');
const path = require('node:path');

const acorn = require('acorn');
const babel = require('@babel/core');

const TARGET_ES = 2019; // all ES2019 syntax works in Safari 12

const plugins = [
  '@babel/plugin-transform-class-static-block',
  '@babel/plugin-transform-private-property-in-object',
  '@babel/plugin-transform-private-methods',
  '@babel/plugin-transform-class-properties',
  '@babel/plugin-transform-logical-assignment-operators',
  '@babel/plugin-transform-nullish-coalescing-operator',
  '@babel/plugin-transform-optional-chaining',
].map((name) => require.resolve(name));

const dist = path.resolve(process.argv[2] ?? 'dist');
const dir = path.join(dist, '_expo', 'static', 'js', 'web');
if (!fs.existsSync(dir)) {
  console.error(`web-compat: no web bundles in ${dir}. Run \`npx expo export -p web\` first.`);
  process.exit(1);
}

let failed = false;
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const file = path.join(dir, name);
  const source = fs.readFileSync(file, 'utf8');
  const { code } = babel.transformSync(source, {
    filename: name,
    babelrc: false,
    configFile: false,
    sourceType: 'script',
    compact: true,
    comments: false,
    plugins,
  });
  try {
    acorn.parse(code, { ecmaVersion: TARGET_ES, sourceType: 'script' });
  } catch (e) {
    failed = true;
    console.error(`web-compat: ${name} still has syntax newer than ES${TARGET_ES} (${e.message}):`);
    console.error(`  ...${code.slice(Math.max(0, e.pos - 80), e.pos + 40)}...`);
    continue;
  }
  fs.writeFileSync(file, code);
  console.log(`web-compat: ${name} ok (${Math.round(source.length / 1024)} KB -> ${Math.round(code.length / 1024)} KB)`);
}
process.exit(failed ? 1 : 0);
