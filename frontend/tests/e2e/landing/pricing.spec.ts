import { test, expect } from '@playwright/test';
import { calcularPrecioConDescuento } from '../../utils/test-data';

test.describe('Landing Page - Pricing y Descuentos', () => {
  test('Selector de plazo cambia precios', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const section = page.locator('#planes');
    await expect(section).toBeVisible({ timeout: 30000 });

    await section.locator('button:has-text("3 meses")').click();
    await section.locator('button:has-text("6 meses")').click();
    await section.locator('button:has-text("12 meses")').click();

    await expect(section.getByRole('heading', { name: 'BASIC' })).toBeVisible();
    await expect(section.getByRole('heading', { name: 'PRO' })).toBeVisible();
    await expect(section.getByRole('heading', { name: 'FULL' })).toBeVisible();
  });

  test('DI-02: Descuentos se calculan correctamente', async () => {
    expect(calcularPrecioConDescuento(90000, 1)).toBe(90000);
    expect(calcularPrecioConDescuento(90000, 3)).toBe(81000);
    expect(calcularPrecioConDescuento(90000, 6)).toBe(72000);
    expect(Math.round(calcularPrecioConDescuento(90000, 12))).toBe(63000);
  });

  test('Contratar page con query params carga plan', async ({ page }) => {
    await page.goto('/contratar?plan=pro&plazo=6');
    await expect(page.locator('text=Contratar Plan')).toBeVisible({ timeout: 30000 });
  });
});
