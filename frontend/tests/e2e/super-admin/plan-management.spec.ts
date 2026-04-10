import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Super Admin - Gestion de Planes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('SA-08: Listar planes existentes', async ({ page }) => {
    await page.goto('/admin/planes');
    await expect(page.locator('text=Gestión de Planes')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'BASIC' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'PRO' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'FULL' })).toBeVisible();
  });

  test('Boton nuevo plan existe', async ({ page }) => {
    await page.goto('/admin/planes');
    await expect(page.locator('button:has-text("Nuevo Plan")')).toBeVisible({ timeout: 30000 });
  });

  test('Modal de nuevo plan se abre', async ({ page }) => {
    await page.goto('/admin/planes');
    await page.locator('button:has-text("Nuevo Plan")').click({ timeout: 30000 });
    await expect(page.locator('text=Crear')).toBeVisible({ timeout: 15000 });
  });
});
