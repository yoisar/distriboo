import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Comisiones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('RE-04: Pagina de comisiones carga', async ({ page }) => {
    await page.goto('/revendedor/comisiones');
    await expect(page.locator('text=Comisiones').first()).toBeVisible({ timeout: 30000 });
  });

  test('RE-05: Pagina de liquidaciones carga', async ({ page }) => {
    await page.goto('/revendedor/liquidaciones');
    await expect(page.locator('text=Liquidaciones').first()).toBeVisible({ timeout: 30000 });
  });
});
