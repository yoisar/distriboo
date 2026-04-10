import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Escenario: Flujo completo login por roles', () => {
  test('SA login -> navegar secciones admin', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Panel de Administración').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/planes');
    await expect(page.locator('text=Planes').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/comisiones');
    await expect(page.locator('text=Comisiones').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/distribuidores');
    await expect(page.locator('text=Distribuidores').first()).toBeVisible({ timeout: 30000 });
  });

  test('Distribuidor login -> dashboard y secciones', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Panel de Administración').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos').first()).toBeVisible({ timeout: 30000 });
  });
});
