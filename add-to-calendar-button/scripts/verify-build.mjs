import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginPhp = await readFile(path.join(root, 'add-to-calendar-button.php'), 'utf8');
const readme = await readFile(path.join(root, 'readme.txt'), 'utf8');
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const atcbPackage = JSON.parse(await readFile(path.join(root, 'node_modules/add-to-calendar-button/package.json'), 'utf8'));

function matchVersion(pattern, source, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not read ${label}.`);
  return match[1];
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}.`);
}

const metadataVersion = matchVersion(/^ \* Version:\s+([^\s]+)$/m, pluginPhp, 'plugin metadata version');
const pluginVersion = matchVersion(/define\(\s*'ATCB_PLUGIN_VERSION',\s*'([^']+)'\s*\)/, pluginPhp, 'ATCB_PLUGIN_VERSION');
const scriptVersion = matchVersion(/define\(\s*'ATCB_SCRIPT_VERSION',\s*'([^']+)'\s*\)/, pluginPhp, 'ATCB_SCRIPT_VERSION');
const stableTag = matchVersion(/^Stable tag:\s+([^\s]+)$/m, readme, 'Stable tag');

assertEqual(metadataVersion, packageJson.version, 'Plugin metadata version');
assertEqual(pluginVersion, packageJson.version, 'ATCB_PLUGIN_VERSION');
assertEqual(stableTag, packageJson.version, 'Stable tag');
assertEqual(packageJson.devDependencies['add-to-calendar-button'], atcbPackage.version, 'Pinned add-to-calendar-button version');
assertEqual(scriptVersion, atcbPackage.version, 'ATCB_SCRIPT_VERSION');

const outputRoot = path.join(root, 'build/atcb', atcbPackage.version);
const pairs = [
  ['dist/atcb.min.js', 'atcb.min.js'],
  ['LICENSE.txt', 'LICENSE.txt'],
];

for (const [source, destination] of pairs) {
  const output = await readFile(path.join(outputRoot, destination));
  const upstream = await readFile(path.join(root, 'node_modules/add-to-calendar-button', source));
  if (!output.equals(upstream)) throw new Error(`${destination} differs from the installed package.`);
}

for (const [directory, extension] of [['styles', '.css'], ['locales', '.json']]) {
  const sourceRoot = path.join(root, 'node_modules/add-to-calendar-button/dist', directory);
  const sourceFiles = (await readdir(sourceRoot)).filter((file) => path.extname(file) === extension).sort();
  const outputFiles = (await readdir(path.join(outputRoot, directory))).sort();
  assertEqual(JSON.stringify(outputFiles), JSON.stringify(sourceFiles), `${directory} file list`);

  for (const file of sourceFiles) {
    const output = await readFile(path.join(outputRoot, directory, file));
    const upstream = await readFile(path.join(sourceRoot, file));
    if (!output.equals(upstream)) throw new Error(`${directory}/${file} differs from the installed package.`);
  }
}

try {
  const oldScripts = (await readdir(path.join(root, 'lib'))).filter((file) => file.endsWith('.js'));
  assertEqual(oldScripts.length, 0, 'Old lib scripts in release payload');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const distIgnore = await readFile(path.join(root, '.distignore'), 'utf8');
if (distIgnore.split(/\r?\n/).some((line) => /^\/?build(?:\/|$)/.test(line.trim()))) {
  throw new Error('Generated build assets are excluded from the release payload.');
}

console.log(`Verified plugin ${packageJson.version} with Add to Calendar Button ${atcbPackage.version}.`);
