import { test, expect } from '@playwright/test';
import { testData, calcularPrecioConDescuento, calcularComision } from '../../utils/test-data';

test.describe('Escenario: Calculo de Comisiones', () => {
  test('Comisiones se calculan correctamente segun plan y plazo', () => {
    const precioDescuento = calcularPrecioConDescuento(90000, 6);
    expect(precioDescuento).toBe(72000);

    const comisionBase = calcularComision(precioDescuento, 1);
    expect(comisionBase.porcentaje).toBe(20);
    expect(comisionBase.monto).toBe(14400);

    const comisionNivel1 = calcularComision(precioDescuento, 3);
    expect(comisionNivel1.porcentaje).toBe(25);
    expect(comisionNivel1.monto).toBe(18000);

    const comisionNivel2 = calcularComision(precioDescuento, 5);
    expect(comisionNivel2.porcentaje).toBe(30);
    expect(comisionNivel2.monto).toBe(21600);
  });

  test('Descuentos por plazo para todos los planes', () => {
    for (const plan of testData.planes) {
      expect(calcularPrecioConDescuento(plan.precio, 1)).toBe(plan.precio);
      expect(calcularPrecioConDescuento(plan.precio, 3)).toBe(plan.precio * 0.9);
      expect(calcularPrecioConDescuento(plan.precio, 6)).toBe(plan.precio * 0.8);
      expect(calcularPrecioConDescuento(plan.precio, 12)).toBe(plan.precio * 0.7);
    }
  });

  test('Comision escala con volumen de clientes', () => {
    const monto = 90000;
    for (let i = 0; i <= 2; i++) expect(calcularComision(monto, i).porcentaje).toBe(20);
    for (let i = 3; i <= 4; i++) expect(calcularComision(monto, i).porcentaje).toBe(25);
    for (let i = 5; i <= 10; i++) expect(calcularComision(monto, i).porcentaje).toBe(30);
  });

  test('SA puede ver comisiones en panel', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.goto('/admin/comisiones');
    await expect(page.locator('text=Comisiones').first()).toBeVisible({ timeout: 30000 });
  });
});
