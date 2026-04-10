import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Landing Page - Codigo de Referido', () => {
  test('Campo de codigo de referido existe en contratar', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    const refInput = page.locator('input[placeholder="Ingresa el código"]');
    await expect(refInput).toBeVisible({ timeout: 30000 });
  });

  test('Boton Validar existe', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Validar")')).toBeVisible({ timeout: 30000 });
  });

  test('Codigo de referido valido se valida', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    const refInput = page.locator('input[placeholder="Ingresa el código"]');
    await expect(refInput).toBeVisible({ timeout: 30000 });
    await refInput.fill(testData.revendedores[0].codigo_referido);
    await page.locator('button:has-text("Validar")').click();
    await expect(page.locator('text=válido')).toBeVisible({ timeout: 15000 });
  });

  test('Codigo de referido invalido muestra error', async ({ page }) => {
    await page.goto('/contratar');
    await page.waitForLoadState('networkidle');
    const refInput = page.locator('input[placeholder="Ingresa el código"]');
    await expect(refInput).toBeVisible({ timeout: 30000 });
    await refInput.fill('CODIGO_INEXISTENTE');
    await page.locator('button:has-text("Validar")').click();
    await expect(page.locator('text=inválido')).toBeVisible({ timeout: 15000 });
  });
});
