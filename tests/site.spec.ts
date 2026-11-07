import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home, privacy, and missing pages have readable static content without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, heading, status] of [
    ['/', 'Your vision. A partner to build it.', 200],
    ['/privacy', 'Privacy', 200],
    ['/this-page-does-not-exist', 'Let’s get you back on track.', 404],
  ] as const) {
    const response = await page.goto(`http://127.0.0.1:4174${path}`);
    expect(response?.status()).toBe(status);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Let’s talk — email Tim about your project' }).first()).toHaveAttribute('href', /^mailto:tim@vanreenen\.me/);
  }
  await context.close();
});

test('privacy navigation and browser history preserve real pages and metadata', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Your vision. A partner to build it.');
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page).toHaveTitle('Privacy — TVR Works');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://tvr.works/privacy');
  await page.getByRole('link', { name: 'Back to TVR Works' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4174/');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('contact actions retain link semantics and keyboard users can skip the header', async ({ page, browserName }) => {
  await page.goto('/');
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const contact = page.getByRole('link', { name: 'Let’s talk — email Tim about your project' });
  await expect(contact).toHaveCount(2);
  for (const link of await contact.all()) {
    await expect(link).not.toHaveAttribute('role', 'button');
    const color = await link.evaluate(el => getComputedStyle(el).color);
    const background = await link.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(color).not.toBe(background);
  }
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/tvanreenen/');
});

test('service content reflows without horizontal overflow from 320px through large desktops', async ({ page }) => {
  for (const width of [320, 390, 540, 768, 800, 801, 1023, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `overflow at ${width}px`).toBe(true);
    for (const text of ['Create something new', 'Modernize what exists', 'Put AI to work', 'Get technical direction']) {
      await expect(page.getByRole('heading', { name: text })).toBeVisible();
    }
  }
});

test('200% text remains readable and reduced motion is respected', async ({ page }) => {
  for (const width of [320, 640, 1023]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `200% text overflow at ${width}px`).toBe(true);
    await expect(page.getByRole('link', { name: 'Privacy', exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
});

for (const route of ['/', '/privacy', '/missing-page']) {
  test(`accessibility scan of ${route}`, async ({ page }) => {
    await page.goto(route);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    expect(result.violations).toEqual([]);
  });
}

test('search and sharing metadata are complete while local indexing stays disabled', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /custom applications/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://tvr.works/');
  const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(graph['@graph'].map((entry: { '@type': string }) => entry['@type'])).toEqual(['Organization', 'Person', 'WebSite']);
  const image = await request.get('/social-card.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  expect(await (await request.get('/robots.txt')).text()).toBe('User-agent: *\nDisallow: /\n');
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('<url>');
});
