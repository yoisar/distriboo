import { test, expect } from '@playwright/test';
import { testData, calcularComision } from '../../utils/test-data';

test.describe('Escenario: Bonus de Comision por Volumen', () => {
  test('Revendedor puede ver su dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Clientes Activos')).toBeVisible({ timeout: 30000 });
  });

  test('Calculos de bonus escalonados son correctos', () => {
    const comision2 = calcularComision(90000, 2);
    expect(comision2.porcentaje).toBe(20);
    expect(comision2.monto).toBe(18000);

    const comision3 = calcularComision(90000, 3);
    expect(comision3.porcentaje).toBe(25);
    expect(comision3.monto).toBe(22500);

    const comision5 = calcularComision(90000, 5);
    expect(comision5.porcentaje).toBe(30);
    expect(comision5.monto).toBe(27000);
  });
});
