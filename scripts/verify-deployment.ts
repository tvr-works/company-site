import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { siteIdentity, sitePages, resolveSiteOrigin } from '../src/site-config.ts';

type DeploymentMode = 'production' | 'preview';
type DeploymentOptions = { url: string; mode: DeploymentMode; expectedCommit: string };
const pages = Object.values(sitePages).filter((entry) => entry.indexable);

// Read the generated, quoted metadata attributes, independently of their order.
function metadataAttributes(html: string): Map<string, string>[] {
  return [...html.matchAll(/<(?:meta|link)\b[^>]*>/gu)].map(
    (tag) =>
      new Map(
        [...tag[0].matchAll(/([\w:-]+)=(['"])(.*?)\2/gu)].map((attribute) => [
          attribute[1]!,
          attribute[3]!,
        ]),
      ),
  );
}

export async function verifyDeployment({
  url,
  mode,
  expectedCommit,
}: DeploymentOptions): Promise<void> {
  const origin = resolveSiteOrigin(url);
  assert.match(expectedCommit, /^[a-f0-9]{40}$/u, 'Expected the exact deployed commit SHA.');
  assert.ok(mode === 'production' || mode === 'preview', 'Expected production or preview mode.');
  const isPublic = mode === 'production';
  await Promise.all([
    ...pages.map(async (page) => {
      const response = await fetch(`${origin}${page.path}`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, `${origin}${page.path}`);
      assert.match(response.headers.get('content-type') ?? '', /text\/html/u, 'HTML content type');
      const html = await response.text();
      const metadata = metadataAttributes(html);
      assert.equal(
        metadata.find((entry) => entry.get('rel') === 'canonical')?.get('href'),
        `${siteIdentity.origin}${page.path}`,
        'Canonical URL',
      );
      assert.equal(
        metadata.find((entry) => entry.get('name') === 'robots')?.get('content'),
        isPublic ? 'index, follow' : 'noindex, follow',
        'HTML indexing policy',
      );
      const edgeRobots = response.headers.get('x-robots-tag') ?? '';
      assert.equal(/\bnoindex\b/iu.test(edgeRobots), !isPublic, 'Edge indexing policy');
      assert.ok(html.includes(`mailto:${siteIdentity.email}`), 'Native contact links');
      const csp = response.headers.get('content-security-policy') ?? '';
      assert.ok(
        csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'none'"),
        'Security headers',
      );
      assert.equal(
        response.headers.get('x-content-type-options'),
        'nosniff',
        'Content sniffing policy',
      );
    }),
    (async () => {
      const response = await fetch(`${origin}/build-info.json`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, 'Deployment identity response');
      const info: unknown = await response.json();
      assert.ok(
        info && typeof info === 'object' && 'commit' in info && 'indexing' in info,
        'Deployment identity',
      );
      assert.equal(info.commit, expectedCommit, 'Deployed commit matches the intended release');
      assert.equal(info.indexing, isPublic ? 'public' : 'preview', 'Deployment indexing identity');
    })(),
    (async () => {
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(15_000) });
      assert.equal(response.status, 200, 'Robots response');
      const robots = await response.text();
      if (isPublic) {
        assert.match(robots, /^Allow: \/\s*$/mu, 'Public crawling');
        assert.ok(!/^Disallow: \/\s*$/mu.test(robots), 'Public crawling must not be blocked');
        assert.ok(
          robots.includes(`Sitemap: ${siteIdentity.origin}/sitemap.xml`),
          'Public sitemap declaration',
        );
      } else assert.match(robots, /^Disallow: \/\s*$/mu, 'Preview crawling is blocked');
    })(),
    (async () => {
      const response = await fetch(`${origin}/sitemap.xml`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 200, 'Sitemap response');
      const xml = await response.text();
      const entries = [...xml.matchAll(/<loc>(.*?)<\/loc>/gu)].map((match) => match[1]);
      const expected = isPublic ? pages.map((page) => `${siteIdentity.origin}${page.path}`) : [];
      assert.deepEqual(new Set(entries), new Set(expected), 'Exact sitemap entries');
    })(),
    (async () => {
      const response = await fetch(`${origin}/missing-deployment-check`, {
        signal: AbortSignal.timeout(15_000),
      });
      assert.equal(response.status, 404, 'Missing pages retain a real 404');
      const html = await response.text();
      assert.ok(
        metadataAttributes(html).some(
          (entry) => entry.get('name') === 'robots' && entry.get('content')?.includes('noindex'),
        ),
        '404 indexing',
      );
    })(),
  ]);
}

async function main() {
  const deployment = process.env.DEPLOYMENT_URL;
  const expectedCommit = process.env.EXPECTED_COMMIT_SHA;
  const mode = process.env.DEPLOYMENT_MODE ?? 'production';
  assert.ok(deployment && expectedCommit, 'DEPLOYMENT_URL and EXPECTED_COMMIT_SHA are required.');
  assert.ok(
    mode === 'production' || mode === 'preview',
    'DEPLOYMENT_MODE must be production or preview.',
  );
  const aliasOption = process.env.CHECK_PRODUCTION_ALIAS;
  assert.ok(
    aliasOption === undefined || aliasOption === '0' || aliasOption === '1',
    'CHECK_PRODUCTION_ALIAS must be 0 or 1.',
  );
  const checkProduction =
    aliasOption === '1' || (aliasOption === undefined && mode === 'production');
  assert.ok(
    mode === 'production' || !checkProduction,
    'Preview verification must not target the production alias.',
  );
  const origins = new Set([
    resolveSiteOrigin(deployment),
    ...(checkProduction ? [siteIdentity.origin] : []),
  ]);

  const release: Omit<DeploymentOptions, 'url'> = { mode, expectedCommit };

  // Aliases can take a few seconds to reach every edge location.
  async function verifyWithRetry(origin: string, attempt = 1): Promise<void> {
    try {
      await verifyDeployment({
        url: origin,
        ...release,
      });
      console.log(`Verified ${mode} deployment ${expectedCommit} at ${origin}`);
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`Deployment check ${attempt} failed at ${origin}; retrying.`);
      await setTimeout(5_000);
      return verifyWithRetry(origin, attempt + 1);
    }
  }
  await Promise.all([...origins].map((origin) => verifyWithRetry(origin)));
}

if (import.meta.main) await main();
