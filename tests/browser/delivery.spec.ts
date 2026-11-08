import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

// Exercise the policy date west of UTC as well as the prerendered server output.
test.use({ timezoneId: 'America/Los_Angeles' });

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('home, privacy, and missing pages have readable static content', async ({ page }) => {
    for (const [path, heading, status] of [
      ['/', 'Your vision. A partner to build it.', 200],
      ['/privacy', 'Privacy', 200],
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
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /custom applications/i,
    );
    const publicBuild = process.env.VITE_SITE_INDEXING === 'public';
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      publicBuild ? 'index, follow' : 'noindex, follow',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://tvr.works/',
    );
    const graph: unknown = JSON.parse(
      await page.locator('script[type="application/ld+json"]').innerText(),
    );
    expect(graph).toMatchObject({
      '@graph': [{ '@type': 'Organization' }, { '@type': 'Person' }, { '@type': 'WebSite' }],
    });
    const image = await request.get('/social-card.png');
    expect(image.ok()).toBe(true);
    expect(image.headers()['content-type']).toContain('image/png');
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
      ]);
      expect(sitemap.match(/<lastmod>[^<]+<\/lastmod>/g)).toEqual([
        '<lastmod>2026-11-07</lastmod>',
        '<lastmod>2026-11-07</lastmod>',
      ]);
    } else expect(sitemap).not.toContain('<url>');
    await page.goto('/privacy');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      publicBuild ? 'index, follow' : 'noindex, follow',
    );
    await expect(page.locator('time')).toHaveAttribute('datetime', '2026-11-07');
    await expect(page.locator('time')).toHaveText('November 7, 2026');
    await page.goto('/missing-page');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  },
);

for (const path of ['/', '/privacy', '/missing-page']) {
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
