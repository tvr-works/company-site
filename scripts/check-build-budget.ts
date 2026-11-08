import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import budgets from '../build-budgets.json' with { type: 'json' };

const directory = new URL('../dist/client/assets/', import.meta.url);
const groups: {
  name: string;
  extensions: string[];
  limits: { maxRawKiB: number; maxGzipKiB?: number };
}[] = [
  { name: 'JavaScript', extensions: ['.js'], limits: budgets.javascript },
  { name: 'CSS', extensions: ['.css'], limits: budgets.css },
  { name: 'Fonts', extensions: ['.woff2', '.woff', '.ttf', '.otf'], limits: budgets.fonts },
];
const extensions = new Set(groups.flatMap((group) => group.extensions));
const assets = await Promise.all(
  (await readdir(directory, { recursive: true }))
    .filter((file) => extensions.has(extname(file)))
    .map(async (file) => {
      const buffer = await readFile(new URL(file, directory));
      return {
        extension: extname(file),
        raw: buffer.length,
        gzip: gzipSync(buffer, { level: 9 }).length,
      };
    }),
);
const kib = (bytes: number) => `${(bytes / 1024).toFixed(2)} KiB`;
let exceeded = false;
for (const { name, extensions: groupExtensions, limits } of groups) {
  const files = assets.filter((asset) => groupExtensions.includes(asset.extension));
  if (!files.length)
    throw new Error(`No ${name} assets found. Build the site before checking budgets.`);
  const raw = files.reduce((total, asset) => total + asset.raw, 0);
  const gzip = files.reduce((total, asset) => total + asset.gzip, 0);
  const gzipBudget = limits.maxGzipKiB;
  const over =
    raw > limits.maxRawKiB * 1024 || (gzipBudget !== undefined && gzip > gzipBudget * 1024);
  exceeded ||= over;
  console.log(
    `${over ? 'FAIL' : 'PASS'} ${name}: ${kib(raw)} / ${limits.maxRawKiB} KiB raw${gzipBudget === undefined ? '' : `; ${kib(gzip)} / ${gzipBudget} KiB gzip`}`,
  );
}
if (exceeded)
  throw new Error(
    'Client build exceeds a performance budget. Investigate growth before changing limits.',
  );
