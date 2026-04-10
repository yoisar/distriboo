import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('SA-01: Super Admin puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.getByRole('link', { name: 'Revendedores', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'Comisiones', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Planes', exact: true })).toBeVisible();
  });

  test('RE-01: Revendedor puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.getByRole('link', { name: 'Mis Clientes', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'Comisiones', exact: true })).toBeVisible();
  });

  test('DI-07: Distribuidor puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.getByRole('link', { name: 'Productos', exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'Gestión Pedidos', exact: true })).toBeVisible();
  });

  test('CL-01: Cliente puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.getByRole('link', { name: 'Catálogo', exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('Login falla con credenciales incorrectas', async ({ page }) => {
    await page.locator('#email').fill('wrong@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Las credenciales son incorrectas')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login requiere email valido', async ({ page }) => {
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('12345678');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login requiere contrasena minima', async ({ page }) => {
    await page.locator('#email').fill('test@test.com');
    await page.locator('#password').fill('123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
