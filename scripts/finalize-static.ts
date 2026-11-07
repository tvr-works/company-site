import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { resolveSiteIndexing, resolveSiteOrigin } from '../src/site-config.ts';

const environment = loadEnv('production', process.cwd(), 'VITE_SITE_');
const origin = resolveSiteOrigin(environment.VITE_SITE_ORIGIN);
const publicBuild = resolveSiteIndexing(environment.VITE_SITE_INDEXING, process.env.CF_PAGES_BRANCH) === 'public';
const directory = new URL('../dist/client/', import.meta.url);
const hashes = new Set<string>();
for (const file of ['index.html', 'privacy.html', '404.html']) {
  // Preserve native contact links when Cloudflare processes the prerendered HTML.
  // Keep the exemption in the delivery artifact so React owns its normal markup.
  const html = (await readFile(new URL(file, directory), 'utf8')).replace(
    /(?:<!--email_off-->)?(<a\b[^>]*\bhref="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>)(?:<!--\/email_off-->)?/g,
    '<!--email_off-->$1<!--/email_off-->',
  );
  if (!html.includes('<h1') || !html.includes('TVR Works')) throw new Error(`Missing prerendered content in ${file}`);
  await writeFile(new URL(file, directory), html);
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\bsrc=/.test(match[1]) && match[2]) hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
  }
}
const csp = [
  "default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`,
  "style-src 'self'", "img-src 'self' data:", "font-src 'self'", "connect-src 'self'",
  "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'none'",
].join('; ');
await writeFile(new URL('_headers', directory), `/*\n  Content-Security-Policy: ${csp}\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`);
await writeFile(new URL('robots.txt', directory), publicBuild ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
const urls = publicBuild ? ['/', '/privacy'].map(path => `<url><loc>${origin}${path}</loc><lastmod>2026-11-07</lastmod></url>`).join('') : '';
await writeFile(new URL('sitemap.xml', directory), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);
console.log(`Verified static HTML; generated ${publicBuild ? 'public' : 'preview'} crawler files and CSP.`);
