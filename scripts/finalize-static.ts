import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { resolveSiteIndexing, resolveSiteOrigin, sitePages } from '../src/site-config.ts';

const environment = loadEnv('production', process.cwd(), 'VITE_SITE_');
const origin = resolveSiteOrigin(environment.VITE_SITE_ORIGIN);
const publicBuild =
  resolveSiteIndexing(environment.VITE_SITE_INDEXING, process.env.CF_PAGES_BRANCH) === 'public';
const directory = new URL('../dist/client/', import.meta.url);
const pages = await Promise.all(
  Object.values(sitePages).map(async ({ outputFile: file }) => {
    // Preserve native contact links when Cloudflare processes the prerendered HTML.
    // Keep the exemption in the delivery artifact so React owns its normal markup.
    const html = (await readFile(new URL(file, directory), 'utf8')).replace(
      /(?:<!--email_off-->)?(<a\b[^>]*\bhref="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>)(?:<!--\/email_off-->)?/g,
      '<!--email_off-->$1<!--/email_off-->',
    );
    if (!html.includes('<h1') || !html.includes('TVR Works'))
      throw new Error(`Missing prerendered content in ${file}`);
    await writeFile(new URL(file, directory), html);
    return html;
  }),
);
const hashes = new Set<string>();
for (const html of pages) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attributes = '', content = ''] = match;
    if (!/\bsrc=/.test(attributes) && content)
      hashes.add(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
  }
}
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')}`,
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
].join('; ');
await writeFile(
  new URL('_headers', directory),
  `/*\n  Content-Security-Policy: ${csp}\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`,
);
await writeFile(
  new URL('robots.txt', directory),
  publicBuild
    ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n',
);
const urls = publicBuild
  ? Object.values(sitePages)
      .filter((page) => page.indexable)
      .map(
        (page) =>
          `<url><loc>${origin}${page.path}</loc><lastmod>${page.lastModified}</lastmod></url>`,
      )
      .join('')
  : '';
await writeFile(
  new URL('sitemap.xml', directory),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
);
console.log(
  `Verified static HTML; generated ${publicBuild ? 'public' : 'preview'} crawler files and CSP.`,
);

const commit = process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null;
if (commit !== null && !/^[a-f0-9]{40}$/u.test(commit))
  throw new Error('Expected a full build commit SHA.');
await writeFile(
  new URL('build-info.json', directory),
  JSON.stringify({ commit, indexing: publicBuild ? 'public' : 'preview' }) + '\n',
);
