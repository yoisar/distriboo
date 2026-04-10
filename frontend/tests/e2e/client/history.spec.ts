import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Historial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-07: Pagina mis pedidos carga', async ({ page }) => {
    await page.goto('/pedidos');
    await expect(page.locator('text=Mis Pedidos').first()).toBeVisible({ timeout: 30000 });
  });

  test('Dashboard del cliente muestra resumen', async ({ page }) => {
    await expect(page.locator('text=Panel de Cliente')).toBeVisible({ timeout: 30000 });
  });
});
