import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test('privacy navigation and browser history preserve real pages and metadata', async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    'Your vision. A partner to build it.',
  );
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page).toHaveTitle('Privacy — TVR Works');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://tvr.works/privacy',
  );
  await page.getByRole('link', { name: 'Back to TVR Works' }).click();
  await expect(page).toHaveURL(new URL('/', baseURL).href);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('contact actions retain link semantics and keyboard users can skip the header', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const contact = page.getByRole('link', { name: 'Let’s talk — email Tim about your project' });
  await expect(contact).toHaveCount(3);
  for (const link of await contact.all()) {
    await expect(link).toHaveAttribute('href', 'mailto:tim@tvr.works');
    await expect(link).not.toHaveAttribute('role', 'button');
    const color = await link.evaluate((el) => getComputedStyle(el).color);
    const background = await link.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(color).not.toBe(background);
  }
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveCount(2);
  for (const label of ['Header contact', 'Footer contact']) {
    const navigation = page.getByRole('navigation', { name: label, exact: true });
    await expect(navigation.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/tvanreenen/',
    );
    await expect(
      navigation.getByRole('link', { name: 'Let’s talk — email Tim about your project' }),
    ).toHaveAttribute('href', 'mailto:tim@tvr.works');
  }
  await expect(
    page.locator('.footer-legal').getByRole('link', { name: 'Privacy', exact: true }),
  ).toHaveAttribute('href', '/privacy');
  await expect(page.locator('.perspective-copy').getByRole('link')).toHaveCount(0);
});

test('service content reflows without horizontal overflow from 320px through large desktops', async ({
  page,
}) => {
  for (const width of [320, 390, 540, 768, 800, 801, 1023, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `overflow at ${width}px`,
    ).toBe(true);
    for (const text of [
      'Create something new',
      'Modernize what exists',
      'Put AI to work',
      'Get technical direction',
    ]) {
      await expect(page.getByRole('heading', { name: text })).toBeVisible();
    }
  }
});

test('footer groups stay balanced and separate at phone widths and enlarged text', async ({
  page,
}) => {
  for (const scale of [1, 2]) {
    for (const width of [320, 390, 540, 541, 639, 640, 671, 672, 673, 768, 1023, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = `${value * 100}%`;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      const footer = page.getByRole('contentinfo');
      const [footerBox, legal, contacts] = await Promise.all([
        footer.boundingBox(),
        footer.locator('.footer-legal').boundingBox(),
        footer.getByRole('navigation', { name: 'Footer contact' }).boundingBox(),
      ]);
      if (!footerBox || !legal || !contacts) throw new Error('Footer groups have no layout');
      const context = `${width}px at ${scale * 100}% text`;
      expect(
        legal.x + legal.width <= contacts.x ||
          contacts.x + contacts.width <= legal.x ||
          legal.y + legal.height <= contacts.y ||
          contacts.y + contacts.height <= legal.y,
        `footer overlap: ${context}`,
      ).toBe(true);
      if (width <= 540) {
        expect(legal.y + legal.height, context).toBeLessThanOrEqual(contacts.y);
        for (const group of [legal, contacts]) {
          expect(
            Math.abs(group.x + group.width / 2 - (footerBox.x + footerBox.width / 2)),
            `footer centering: ${context}`,
          ).toBeLessThan(1);
        }
      }
      for (const link of await footer.getByRole('link').all()) {
        const box = await link.boundingBox();
        if (!box) throw new Error(`Footer link has no layout: ${context}`);
        expect(box.x, context).toBeGreaterThanOrEqual(footerBox.x - 1);
        expect(box.x + box.width, context).toBeLessThanOrEqual(footerBox.x + footerBox.width + 1);
        expect(box.height, context).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test('200% text remains readable and reduced motion is respected', async ({ page }) => {
  for (const width of [320, 640, 1023]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `200% text overflow at ${width}px`,
    ).toBe(true);
    await expect(page.getByRole('link', { name: 'Privacy', exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
});

for (const route of ['/', '/privacy', '/missing-page']) {
  test(`accessibility scan of ${route}`, async ({ page }) => {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
