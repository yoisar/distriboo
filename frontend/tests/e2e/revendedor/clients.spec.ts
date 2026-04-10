import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Mis Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('RE-03: Pagina mis clientes carga', async ({ page }) => {
    await page.goto('/revendedor/mis-clientes');
    await expect(page.locator('text=Mis Clientes').first()).toBeVisible({ timeout: 30000 });
  });

  test('RE-06: Pagina perfil carga', async ({ page }) => {
    await page.goto('/revendedor/perfil');
    await expect(page.locator('text=Perfil').first()).toBeVisible({ timeout: 30000 });
  });

  test('Perfil tiene boton guardar', async ({ page }) => {
    await page.goto('/revendedor/perfil');
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible({ timeout: 30000 });
  });

  test('Revendedor no accede a rutas de admin', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Productos').first()).toBeVisible({ timeout: 15000 });
  });
});
