import { test, expect } from '@playwright/test';

test.describe('Password Reset', () => {
  test('Pagina de login existe y tiene formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('Login muestra titulo correcto', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Ingresá a tu cuenta')).toBeVisible();
  });
});
