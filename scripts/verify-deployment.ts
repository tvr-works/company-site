import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { siteIdentity, sitePages, resolveSiteOrigin } from '../src/site-config.ts';

const deployment = process.env.DEPLOYMENT_URL;
if (!deployment) throw new Error('DEPLOYMENT_URL is required.');
const origins = new Set([resolveSiteOrigin(deployment), siteIdentity.origin]);
const pages = Object.values(sitePages).filter((entry) => entry.indexable);

async function verify(origin: string) {
  await Promise.all([
    ...pages.map(async (page) => {
      const response = await fetch(`${origin}${page.path}`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, `${origin}${page.path}`);
      const html = await response.text();
      assert.ok(html.includes(`href="${siteIdentity.origin}${page.path}"`), 'Canonical URL');
      assert.ok(html.includes('content="index, follow"'), 'Public indexing');
      assert.ok(html.includes(`mailto:${siteIdentity.email}`), 'Native contact links');
      assert.ok(response.headers.get('content-security-policy'), 'Security headers');
    }),
    (async () => {
      const response = await fetch(`${origin}/sitemap.xml`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, 'Sitemap response');
      const xml = await response.text();
      for (const page of pages)
        assert.ok(xml.includes(`<loc>${siteIdentity.origin}${page.path}</loc>`), 'Sitemap entry');
    })(),
    (async () => {
      const response = await fetch(`${origin}/missing-deployment-check`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 404, 'Missing pages retain a real 404');
    })(),
  ]);
}

// Deployment aliases can take a few seconds to reach every edge location.
async function verifyWithRetry(origin: string, attempt = 1): Promise<void> {
  try {
    await verify(origin);
    console.log(`Verified published pages, indexing, sitemap, and security at ${origin}`);
  } catch (error) {
    if (attempt === 3) throw error;
    console.warn(`Deployment check ${attempt} failed at ${origin}; retrying.`);
    await setTimeout(5_000);
    return verifyWithRetry(origin, attempt + 1);
  }
}

await Promise.all([...origins].map((origin) => verifyWithRetry(origin)));
