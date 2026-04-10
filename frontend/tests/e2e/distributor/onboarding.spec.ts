import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('DI-08: Pagina de productos carga', async ({ page }) => {
    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos').first()).toBeVisible({ timeout: 30000 });
  });

  test('DI-09: Pagina de clientes carga', async ({ page }) => {
    await page.goto('/admin/clientes');
    await expect(page.locator('text=Clientes').first()).toBeVisible({ timeout: 30000 });
  });

  test('DI-10: Pagina de zonas logisticas carga', async ({ page }) => {
    await page.goto('/admin/zonas');
    await expect(page.locator('text=Zonas').first()).toBeVisible({ timeout: 30000 });
  });
});
