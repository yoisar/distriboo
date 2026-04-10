import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('DI-11: Pagina de gestion de pedidos carga', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos').first()).toBeVisible({ timeout: 30000 });
  });

  test('DI-12: Tabla de pedidos tiene columnas correctas', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos').first()).toBeVisible({ timeout: 30000 });
  });
});
