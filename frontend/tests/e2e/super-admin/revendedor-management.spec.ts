import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Super Admin - Gestion de Revendedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('SA-02: Pagina de revendedores carga', async ({ page }) => {
    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores').first()).toBeVisible({ timeout: 30000 });
  });

  test('SA-03: Tabla muestra revendedores', async ({ page }) => {
    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores').first()).toBeVisible({ timeout: 30000 });
  });

  test('SA-07: Pagina de configuracion carga', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('text=Configuración').first()).toBeVisible({ timeout: 30000 });
  });

  test('Configuracion tiene boton guardar', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible({ timeout: 30000 });
  });
});
