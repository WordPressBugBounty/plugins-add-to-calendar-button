import { access, copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(root, 'node_modules/add-to-calendar-button');
const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const outputRoot = path.join(root, 'build/atcb', packageJson.version);

const requiredFiles = [
  'dist/atcb.min.js',
  'dist/styles/default.css',
  'dist/locales/en.json',
  'LICENSE.txt',
];

await Promise.all(requiredFiles.map((file) => access(path.join(packageRoot, file))));
await rm(path.join(root, 'build/atcb'), { recursive: true, force: true });
await Promise.all([
  mkdir(path.join(outputRoot, 'styles'), { recursive: true }),
  mkdir(path.join(outputRoot, 'locales'), { recursive: true }),
]);

async function copyFiles(source, destination, extension) {
  const files = (await readdir(source, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && path.extname(entry.name) === extension)
    .map((entry) => entry.name);

  await Promise.all(files.map((file) => copyFile(path.join(source, file), path.join(destination, file))));
}

await Promise.all([
  copyFile(path.join(packageRoot, 'dist/atcb.min.js'), path.join(outputRoot, 'atcb.min.js')),
  copyFile(path.join(packageRoot, 'LICENSE.txt'), path.join(outputRoot, 'LICENSE.txt')),
  copyFiles(path.join(packageRoot, 'dist/styles'), path.join(outputRoot, 'styles'), '.css'),
  copyFiles(path.join(packageRoot, 'dist/locales'), path.join(outputRoot, 'locales'), '.json'),
]);

console.log(`Copied Add to Calendar Button ${packageJson.version} runtime assets.`);
