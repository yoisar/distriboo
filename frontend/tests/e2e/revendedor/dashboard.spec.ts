import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('RE-02: Dashboard muestra stat cards', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Clientes Activos')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Comisiones Pendientes')).toBeVisible();
  });

  test('Dashboard muestra codigo de referido', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Código de Referido')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('button:has-text("Copiar")')).toBeVisible();
  });

  test('Dashboard tiene quick links', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Mis Clientes').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Comisiones').first()).toBeVisible();
  });
});
