import { test, expect } from '@playwright/test';

test.describe('Registro de Distribuidor', () => {
  test('Pagina de contratar carga correctamente', async ({ page }) => {
    await page.goto('/contratar');
    await expect(page.locator('text=Contratar Plan')).toBeVisible({ timeout: 30000 });
  });

  test('Formulario muestra secciones del wizard', async ({ page }) => {
    await page.goto('/contratar');
    await expect(page.locator('text=Elige tu plan')).toBeVisible({ timeout: 30000 });
  });

  test('Se pueden seleccionar los 3 planes', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    const basic = page.getByRole('button', { name: /^BASIC/ });
    const pro = page.getByRole('button', { name: /^PRO/ });
    const full = page.getByRole('button', { name: /^FULL/ });
    await expect(basic).toBeVisible({ timeout: 30000 });
    await expect(pro).toBeVisible();
    await expect(full).toBeVisible();
  });

  test('Se muestran botones de plazo', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Mensual")')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('button:has-text("3 meses")')).toBeVisible();
    await expect(page.locator('button:has-text("6 meses")')).toBeVisible();
    await expect(page.locator('button:has-text("12 meses")')).toBeVisible();
  });

  test('Formulario de datos del distribuidor tiene campos requeridos', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('label').filter({ hasText: /Nombre Comercial/ }).first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('label').filter({ hasText: /Email Contacto/ }).first()).toBeVisible();
  });
});
