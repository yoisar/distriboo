import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-04: Nuevo pedido muestra buscador', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.locator('text=Nuevo Pedido').first()).toBeVisible({ timeout: 30000 });
  });

  test('CL-05: Nuevo pedido muestra resumen', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.getByRole('heading', { name: 'Mi pedido' })).toBeVisible({ timeout: 30000 });
  });

  test('CL-06: Sidebar cliente tiene enlaces correctos', async ({ page }) => {
    await expect(page.locator('a[href="/productos"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a[href="/pedidos/nuevo"]').first()).toBeVisible();
    await expect(page.locator('a[href="/pedidos"]').first()).toBeVisible();
  });

  test('CL-08: Lista de pedidos carga', async ({ page }) => {
    await page.goto('/pedidos');
    await expect(page.locator('text=Mis Pedidos').first()).toBeVisible({ timeout: 30000 });
  });
});
