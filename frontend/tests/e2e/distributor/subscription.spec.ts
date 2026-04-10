import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Suscripcion', () => {
  test('DI-06: SA puede ver distribuidores', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.goto('/admin/distribuidores');
    await expect(page.locator('text=Distribuidores').first()).toBeVisible({ timeout: 30000 });
  });

  test('Distribuidor ve dashboard con stats', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Panel de Administración')).toBeVisible({ timeout: 30000 });
  });
});
