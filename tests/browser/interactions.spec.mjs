import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const pages = JSON.parse(fs.readFileSync(new URL('../../docs/browser-pages.json', import.meta.url), 'utf8'));
const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = []; pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]); });
for (const file of pages) {
  test(`${file}: local images, responsive width and JavaScript`, async ({ page }) => {
    await page.goto('/' + file);
    await expect(page.locator('body')).toBeVisible();
    await expect.poll(() => page.evaluate(() => [...document.images]
      .filter(img => img.src.startsWith(location.origin))
      .every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('Add Post modal opens and closes without saving', async ({ page }) => {
  await page.goto('/');
  await page.locator('button[data-bs-target="#addPostModal"]').click();
  const modal = page.locator('#addPostModal');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.tiptap')).toBeVisible();
  await modal.locator('[data-bs-dismiss="modal"]').first().click();
  await expect(modal).toBeHidden();
});
test('rich text synchronizes bold HTML and rejects executable links', async ({ page }) => {
  await page.goto('/details.html');
  const editor = page.locator('.tiptap');
  await editor.fill('Browser fixture text');
  await editor.press('Control+A');
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  await expect(page.locator('textarea')).toHaveValue(/<strong>Browser fixture text<\/strong>/);
  const link = page.getByRole('textbox', { name: 'Link URL', exact: true });
  await link.fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Apply link', exact: true }).click();
  await expect(link).toHaveAttribute('aria-invalid', 'true');
  await expect(editor.locator('a')).toHaveCount(0);
  await link.fill('https://example.com/fixture');
  await page.getByRole('button', { name: 'Apply link', exact: true }).click();
  await expect(editor.locator('a')).toHaveAttribute('href', 'https://example.com/fixture');
  await expect(page.locator('textarea')).toHaveValue(/https:\/\/example.com\/fixture/);
});
