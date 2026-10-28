import { build } from 'esbuild';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const result = await build({
  entryPoints: ['src/rich-editor.mjs'],
  outfile: 'js/rich-editor.bundle.js',
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  legalComments: 'none',
  banner: { js: '/*! Runtime package licenses: ../docs/EDITOR-LICENSES.txt */' },
  metafile: true,
});
const packages = new Set();
for (const input of Object.keys(result.metafile.inputs)) {
  if (!input.includes('node_modules/')) continue;
  let folder = path.dirname(path.resolve(input));
  while (folder.startsWith(root) && folder !== root) {
    try { await readFile(path.join(folder, 'package.json')); packages.add(folder); break; }
    catch { folder = path.dirname(folder); }
  }
}
const notices = [];
for (const folder of [...packages].sort()) {
  const metadata = JSON.parse(await readFile(path.join(folder, 'package.json'), 'utf8'));
  const files = (await readdir(folder)).filter(name => /^licen[sc]e(?:\.|$)/i.test(name)).sort();
  if (files.length === 0) throw new Error(`License missing: ${metadata.name}`);
  const license = (await readFile(path.join(folder, files[0]), 'utf8')).replace(/\r\n/g, '\n');
  notices.push(`${metadata.name}@${metadata.version}\n${metadata.license}\n${license}`);
}
await writeFile('docs/EDITOR-LICENSES.txt', notices.join('\n\n----------------------------------------\n\n'));
console.log(`Built local editor; retained ${packages.size} runtime package license notices.`);
