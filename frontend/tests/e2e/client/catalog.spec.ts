import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Catalogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-02: Cliente ve catalogo', async ({ page }) => {
    await page.goto('/productos');
    await expect(page.locator('text=Catálogo').first()).toBeVisible({ timeout: 30000 });
  });

  test('CL-03: Pagina nuevo pedido carga', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.locator('text=Nuevo Pedido').first()).toBeVisible({ timeout: 30000 });
  });
});
