import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';

// Exercise the policy date west of UTC as well as the prerendered server output.
test.use({ timezoneId: 'America/Los_Angeles' });

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('public pages and missing pages have readable static content', async ({ page }) => {
    for (const [path, heading, status] of [
      ['/', 'Your vision. A partner to build it.', 200],
      ['/privacy', 'Privacy', 200],
      ['/software', 'Apps, libraries & tools.', 200],
      ['/this-page-does-not-exist', 'Let’s get you back on track.', 404],
    ] as const) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(status);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('main#main[tabindex="-1"]')).toHaveCount(1);
      await expect(
        page.getByRole('link', { name: 'Let’s talk — email Tim about your project' }).first(),
      ).toHaveAttribute('href', 'mailto:tim@tvr.works');
    }
  });
});

test(
  'search and sharing metadata match the indexing mode',
  { tag: '@artifact' },
  async ({ page, request }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const preload = page.locator('link[rel="preload"][as="font"]');
    await expect(preload).toHaveCount(1);
    await expect(preload).toHaveAttribute('crossorigin', 'anonymous');
    await expect(preload).toHaveAttribute('type', 'font/woff2');
    const fontPath = await preload.getAttribute('href');
    if (!fontPath) throw new Error('Font preload has no URL');
    expect(
      await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((entry) => /\.woff2(?:\?|$)/.test(entry.name))
          .map((entry) => entry.name),
      ),
    ).toEqual([new URL(fontPath, page.url()).href]);

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /custom applications/i,
    );
    const publicBuild = process.env.VITE_SITE_INDEXING === 'public';
    const buildInfo = await request.get('/build-info.json');
    expect(buildInfo.ok()).toBe(true);
    const identity: unknown = await buildInfo.json();
    expect(identity).toEqual({
      commit: process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
      indexing: publicBuild ? 'public' : 'preview',
    });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      publicBuild ? 'index, follow' : 'noindex, follow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://tvr.works/',
    );
    const logo = await request.get('/brand-logo.png');
    expect(logo.ok()).toBe(true);
    expect(logo.headers()['content-type']).toContain('image/png');
    expect(await sharp(await logo.body()).metadata()).toMatchObject({
      width: 512,
      height: 512,
      format: 'png',
      hasAlpha: false,
    });
    const image = await request.get('/social-card-v2.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/png');
    expect(await sharp(await image.body()).metadata()).toMatchObject({
      width: 1200,
      height: 630,
      format: 'png',
      hasAlpha: false,
    });
    for (const [path, title] of [
      ['/', 'TVR Works — Custom Software, Applied AI & Technical Leadership'],
      ['/privacy', 'Privacy — TVR Works'],
      ['/software', 'Apps, Libraries & Tools — TVR Works'],
    ] as const) {
      const html = await (await request.get(path)).text();
      const preview = await page.evaluate((markup) => {
        const head = new DOMParser().parseFromString(markup, 'text/html').head;
        const tags: Record<string, string> = {};
        for (const meta of head.querySelectorAll('meta')) {
          const key = meta.getAttribute('property') ?? meta.getAttribute('name');
          const content = meta.getAttribute('content');
          if (key && content) tags[key] = content;
        }
        return {
          tags,
          jsonld: head.querySelector('script[type="application/ld+json"]')?.textContent,
          imageCount: head.querySelectorAll('meta[property="og:image"]').length,
        };
      }, html);
      expect(preview.imageCount).toBe(1);
      if (path === '/') {
        const graph: unknown = JSON.parse(preview.jsonld ?? 'null');
        expect(graph).toMatchObject({
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://tvr.works/#organization',
              sameAs: ['https://github.com/tvr-works'],
              founder: { '@id': 'https://tvr.works/#tim' },
              logo: {
                '@type': 'ImageObject',
                url: 'https://tvr.works/brand-logo.png',
                width: 512,
                height: 512,
              },
            },
            { '@type': 'Person', worksFor: { '@id': 'https://tvr.works/#organization' } },
            { '@type': 'WebSite' },
          ],
        });
      }
      expect(preview.tags).toMatchObject({
        'og:type': 'website',
        'og:site_name': 'TVR Works',
        'og:title': title,
        'og:description': expect.any(String),
        'og:url': `https://tvr.works${path}`,
        'og:image': 'https://tvr.works/social-card-v2.png',
        'og:image:type': 'image/png',
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt':
          'TVR Works — Your vision. A partner to build it. Custom software, modernization, AI & technical leadership.',
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': expect.any(String),
        'twitter:image': 'https://tvr.works/social-card-v2.png',
        'twitter:image:alt':
          'TVR Works — Your vision. A partner to build it. Custom software, modernization, AI & technical leadership.',
      });
    }
    expect(await (await request.get('/robots.txt')).text()).toBe(
      publicBuild
        ? 'User-agent: *\nAllow: /\nSitemap: https://tvr.works/sitemap.xml\n'
        : 'User-agent: *\nDisallow: /\n',
    );
    const sitemap = await (await request.get('/sitemap.xml')).text();
    if (publicBuild) {
      expect(sitemap.match(/<loc>[^<]+<\/loc>/g)).toEqual([
        '<loc>https://tvr.works/</loc>',
        '<loc>https://tvr.works/privacy</loc>',
        '<loc>https://tvr.works/software</loc>',
      ]);
      expect(sitemap.match(/<lastmod>[^<]+<\/lastmod>/g)).toEqual([
        '<lastmod>2026-11-08</lastmod>',
        '<lastmod>2026-11-07</lastmod>',
        '<lastmod>2026-11-09</lastmod>',
      ]);
    } else expect(sitemap).not.toContain('<url>');
    await page.goto('/privacy');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      publicBuild ? 'index, follow' : 'noindex, follow',
    );
    await expect(page.locator('time')).toHaveAttribute('datetime', '2026-11-07');
    await expect(page.locator('time')).toHaveText('November 7, 2026');
    await page.goto('/software');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      publicBuild ? 'index, follow' : 'noindex, follow',
    );
    await page.goto('/missing-page');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  },
);

for (const path of ['/', '/privacy', '/software', '/missing-page']) {
  test(
    `static security headers and contact links survive delivery of ${path}`,
    { tag: '@artifact' },
    async ({ request }) => {
      const response = await request.get(path);
      const headers = response.headers();
      const csp = headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/);
      for (const directive of [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'",
        "form-action 'none'",
      ]) {
        expect(csp).toContain(directive);
      }
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
      const html = await response.text();
      for (const [, attributes = '', content = ''] of html.matchAll(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
      )) {
        if (!/\bsrc=/.test(attributes) && content) {
          expect(csp).toContain(
            `'sha256-${createHash('sha256').update(content).digest('base64')}'`,
          );
        }
      }
      const mailtoCount = [...html.matchAll(/href="mailto:tim@tvr\.works"/g)].length;
      expect(mailtoCount).toBeGreaterThan(0);
      expect([
        ...html.matchAll(
          /<!--email_off--><a\b[^>]*href="mailto:tim@tvr\.works"[^>]*>[\s\S]*?<\/a><!--\/email_off-->/g,
        ),
      ]).toHaveLength(mailtoCount);
    },
  );
}
