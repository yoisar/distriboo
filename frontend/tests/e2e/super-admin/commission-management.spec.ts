import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Super Admin - Gestion de Comisiones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('SA-04: Pagina de comisiones carga', async ({ page }) => {
    await page.goto('/admin/comisiones');
    await expect(page.locator('text=Comisiones').first()).toBeVisible({ timeout: 30000 });
  });

  test('SA-09: Pagina de reportes carga', async ({ page }) => {
    await page.goto('/admin/reportes');
    await expect(page.locator('text=Reportes').first()).toBeVisible({ timeout: 30000 });
  });

  test('Reportes tiene tabs', async ({ page }) => {
    await page.goto('/admin/reportes');
    await expect(page.locator('text=Reportes').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Productos Top')).toBeVisible({ timeout: 15000 });
  });
});
