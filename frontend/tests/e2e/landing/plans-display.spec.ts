import { test, expect } from '@playwright/test';

test.describe('Landing Page - Planes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('DI-01: Landing page muestra los 3 planes', async ({ page }) => {
    const section = page.locator('#planes');
    await expect(section).toBeVisible({ timeout: 30000 });
    await expect(section.getByRole('heading', { name: 'BASIC' })).toBeVisible();
    await expect(section.getByRole('heading', { name: 'PRO' })).toBeVisible();
    await expect(section.getByRole('heading', { name: 'FULL' })).toBeVisible();
  });

  test('Landing page muestra caracteristicas de cada plan', async ({ page }) => {
    await expect(page.locator('text=Hasta 50 productos')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Hasta 30 clientes')).toBeVisible();
  });

  test('Landing page tiene botones de contratacion', async ({ page }) => {
    const contratarButtons = page.locator('a[href*="/contratar"]');
    expect(await contratarButtons.count()).toBeGreaterThan(0);
  });

  test('Landing page muestra seccion para revendedores', async ({ page }) => {
    await expect(page.locator('text=ganar dinero')).toBeVisible({ timeout: 30000 });
  });
});
