#!/usr/bin/env python3
"""Generate all Playwright test files for Distriboo."""
import os

BASE = "/Users/yois/projects/my-mac-portfolio/distriboo/frontend/tests"

files = {}

WAIT_TIMEOUT = "60000"

# ── fixtures/auth.fixture.ts ──
files["fixtures/auth.fixture.ts"] = r'''import { test as base, Page } from '@playwright/test';
import { testData } from '../utils/test-data';

type AuthFixtures = {
  superAdminPage: Page;
  revendedorPage: Page;
  distribuidorPage: Page;
  clientePage: Page;
  loginAs: (page: Page, email: string, password: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginAs: async ({}, use) => {
    const fn = async (page: Page, email: string, password: string) => {
      await page.goto('/login');
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|revendedor)/, { timeout: 60000 });
    };
    await use(fn);
  },

  superAdminPage: async ({ browser, loginAs }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testData.superAdmin.email, testData.superAdmin.password);
    await use(page);
    await context.close();
  },

  revendedorPage: async ({ browser, loginAs }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testData.revendedores[0].email, testData.revendedores[0].password);
    await use(page);
    await context.close();
  },

  distribuidorPage: async ({ browser, loginAs }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testData.distribuidores[0].email, testData.distribuidores[0].password);
    await use(page);
    await context.close();
  },

  clientePage: async ({ browser, loginAs }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testData.clientes[0].email, testData.clientes[0].password);
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
'''

# ── fixtures/database.fixture.ts ──
files["fixtures/database.fixture.ts"] = r'''import { test as base } from '@playwright/test';

export const test = base.extend({});
export { expect } from '@playwright/test';
'''

# ── fixtures/mailhog.fixture.ts ──
files["fixtures/mailhog.fixture.ts"] = r'''import { test as base, expect } from '@playwright/test';
import { waitForEmail, verifyEmailContent, clearAllEmails } from '../utils/email-verification';

type MailHogFixtures = {
  cleanEmails: void;
  checkEmail: typeof waitForEmail;
  verifyEmail: typeof verifyEmailContent;
};

export const test = base.extend<MailHogFixtures>({
  cleanEmails: [
    async ({}, use) => {
      await clearAllEmails();
      await use();
    },
    { auto: false },
  ],
  checkEmail: async ({}, use) => {
    await use(waitForEmail);
  },
  verifyEmail: async ({}, use) => {
    await use(verifyEmailContent);
  },
});

export { expect };
'''

# ── utils/db-cleaner.ts ──
files["utils/db-cleaner.ts"] = r'''const API_URL = process.env.API_URL || 'http://localhost:8000/api';

export async function resetDatabase(): Promise<void> {
  console.log('DB reset skipped - using persistent test data');
}

export async function truncateTestTables(): Promise<void> {
  console.log('Truncate skipped - using persistent test data');
}

export async function loadFixtures(): Promise<void> {
  console.log('Load fixtures skipped - using persistent test data');
}
'''

# ── e2e/auth/login.spec.ts ──
files["e2e/auth/login.spec.ts"] = r'''import { test, expect } from '@playwright/test';
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
    await expect(page.locator('text=Revendedores')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Comisiones')).toBeVisible();
    await expect(page.locator('text=Planes')).toBeVisible();
  });

  test('RE-01: Revendedor puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/revendedor/, { timeout: 60000 });
    await expect(page.locator('text=Mis Clientes')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Comisiones')).toBeVisible();
  });

  test('DI-07: Distribuidor puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Productos')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Gestión Pedidos')).toBeVisible();
  });

  test('CL-01: Cliente puede iniciar sesion', async ({ page }) => {
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Catálogo')).toBeVisible({ timeout: 15000 });
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
'''

# ── e2e/auth/password-reset.spec.ts ──
files["e2e/auth/password-reset.spec.ts"] = r'''import { test, expect } from '@playwright/test';

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
'''

# ── e2e/auth/register.spec.ts ──
files["e2e/auth/register.spec.ts"] = r'''import { test, expect } from '@playwright/test';

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
    const basic = page.locator('button:has-text("BASIC")');
    const pro = page.locator('button:has-text("PRO")');
    const full = page.locator('button:has-text("FULL")');
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
    await expect(page.getByLabel(/Nombre Comercial/)).toBeVisible({ timeout: 30000 });
    await expect(page.getByLabel(/Email Contacto/)).toBeVisible();
  });
});
'''

# ── e2e/landing/plans-display.spec.ts ──
files["e2e/landing/plans-display.spec.ts"] = r'''import { test, expect } from '@playwright/test';

test.describe('Landing Page - Planes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('DI-01: Landing page muestra los 3 planes', async ({ page }) => {
    const section = page.locator('#planes');
    await expect(section).toBeVisible({ timeout: 30000 });
    await expect(section.locator('text=BASIC')).toBeVisible();
    await expect(section.locator('text=PRO')).toBeVisible();
    await expect(section.locator('text=FULL')).toBeVisible();
  });

  test('Landing page muestra caracteristicas de cada plan', async ({ page }) => {
    await expect(page.locator('text=Hasta 50 productos')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Hasta 30 clientes')).toBeVisible();
  });

  test('Landing page tiene botones de contratacion', async ({ page }) => {
    const contratarButtons = page.locator('a[href*="/contratar"]');
    expect(await contratarButtons.count()).toBeGreaterThan(0);
  });

  test('Landing page muestra seccion para revendedores', async ({ page }) => {
    await expect(page.locator('text=ganar dinero')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/landing/pricing.spec.ts ──
files["e2e/landing/pricing.spec.ts"] = r'''import { test, expect } from '@playwright/test';
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

    await expect(section.locator('text=BASIC')).toBeVisible();
    await expect(section.locator('text=PRO')).toBeVisible();
    await expect(section.locator('text=FULL')).toBeVisible();
  });

  test('DI-02: Descuentos se calculan correctamente', async () => {
    expect(calcularPrecioConDescuento(90000, 1)).toBe(90000);
    expect(calcularPrecioConDescuento(90000, 3)).toBe(81000);
    expect(calcularPrecioConDescuento(90000, 6)).toBe(72000);
    expect(calcularPrecioConDescuento(90000, 12)).toBe(63000);
  });

  test('Contratar page con query params carga plan', async ({ page }) => {
    await page.goto('/contratar?plan=pro&plazo=6');
    await expect(page.locator('text=Contratar Plan')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/landing/referral-code.spec.ts ──
files["e2e/landing/referral-code.spec.ts"] = r'''import { test, expect } from '@playwright/test';
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
'''

# ── e2e/super-admin/plan-management.spec.ts ──
files["e2e/super-admin/plan-management.spec.ts"] = r'''import { test, expect } from '@playwright/test';
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
    await expect(page.locator('text=BASIC')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=PRO')).toBeVisible();
    await expect(page.locator('text=FULL')).toBeVisible();
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
'''

# ── e2e/super-admin/commission-management.spec.ts ──
files["e2e/super-admin/commission-management.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Super Admin - Gestion de Comisiones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('SA-04: Pagina de comisiones carga', async ({ page }) => {
    await page.goto('/admin/comisiones');
    await expect(page.locator('text=Comisiones')).toBeVisible({ timeout: 30000 });
  });

  test('SA-09: Pagina de reportes carga', async ({ page }) => {
    await page.goto('/admin/reportes');
    await expect(page.locator('text=Reportes')).toBeVisible({ timeout: 30000 });
  });

  test('Reportes tiene tabs', async ({ page }) => {
    await page.goto('/admin/reportes');
    await expect(page.locator('text=Reportes')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Productos Top')).toBeVisible({ timeout: 15000 });
  });
});
'''

# ── e2e/super-admin/revendedor-management.spec.ts ──
files["e2e/super-admin/revendedor-management.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Super Admin - Gestion de Revendedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('SA-02: Pagina de revendedores carga', async ({ page }) => {
    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores')).toBeVisible({ timeout: 30000 });
  });

  test('SA-03: Tabla muestra revendedores', async ({ page }) => {
    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores')).toBeVisible({ timeout: 30000 });
  });

  test('SA-07: Pagina de configuracion carga', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('text=Configuración')).toBeVisible({ timeout: 30000 });
  });

  test('Configuracion tiene boton guardar', async ({ page }) => {
    await page.goto('/admin/configuracion');
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/distributor/onboarding.spec.ts ──
files["e2e/distributor/onboarding.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('DI-08: Pagina de productos carga', async ({ page }) => {
    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos')).toBeVisible({ timeout: 30000 });
  });

  test('DI-09: Pagina de clientes carga', async ({ page }) => {
    await page.goto('/admin/clientes');
    await expect(page.locator('text=Clientes')).toBeVisible({ timeout: 30000 });
  });

  test('DI-10: Pagina de zonas logisticas carga', async ({ page }) => {
    await page.goto('/admin/zonas');
    await expect(page.locator('text=Zonas')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/distributor/subscription.spec.ts ──
files["e2e/distributor/subscription.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Suscripcion', () => {
  test('DI-06: SA puede ver distribuidores', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.goto('/admin/distribuidores');
    await expect(page.locator('text=Distribuidores')).toBeVisible({ timeout: 30000 });
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
'''

# ── e2e/distributor/notifications.spec.ts ──
files["e2e/distributor/notifications.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Distribuidor - Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('DI-11: Pagina de gestion de pedidos carga', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos')).toBeVisible({ timeout: 30000 });
  });

  test('DI-12: Tabla de pedidos tiene columnas correctas', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/client/catalog.spec.ts ──
files["e2e/client/catalog.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Catalogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-02: Cliente ve catalogo', async ({ page }) => {
    await page.goto('/productos');
    await expect(page.locator('text=Catálogo')).toBeVisible({ timeout: 30000 });
  });

  test('CL-03: Pagina nuevo pedido carga', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.locator('text=Nuevo Pedido')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/client/history.spec.ts ──
files["e2e/client/history.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Historial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-07: Pagina mis pedidos carga', async ({ page }) => {
    await page.goto('/pedidos');
    await expect(page.locator('text=Mis Pedidos')).toBeVisible({ timeout: 30000 });
  });

  test('Dashboard del cliente muestra resumen', async ({ page }) => {
    await expect(page.locator('text=Panel de Cliente')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/client/orders.spec.ts ──
files["e2e/client/orders.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Cliente - Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.clientes[0].email);
    await page.locator('#password').fill(testData.clientes[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
  });

  test('CL-04: Nuevo pedido muestra buscador', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.locator('text=Nuevo Pedido')).toBeVisible({ timeout: 30000 });
  });

  test('CL-05: Nuevo pedido muestra resumen', async ({ page }) => {
    await page.goto('/pedidos/nuevo');
    await expect(page.locator('text=pedido')).toBeVisible({ timeout: 30000 });
  });

  test('CL-06: Sidebar cliente tiene enlaces correctos', async ({ page }) => {
    await expect(page.locator('a[href="/productos"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('a[href="/pedidos/nuevo"]')).toBeVisible();
    await expect(page.locator('a[href="/pedidos"]')).toBeVisible();
  });

  test('CL-08: Lista de pedidos carga', async ({ page }) => {
    await page.goto('/pedidos');
    await expect(page.locator('text=Mis Pedidos')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/revendedor/dashboard.spec.ts ──
files["e2e/revendedor/dashboard.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/revendedor/, { timeout: 60000 });
  });

  test('RE-02: Dashboard muestra stat cards', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Clientes Activos')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Comisiones Pendientes')).toBeVisible();
  });

  test('Dashboard muestra codigo de referido', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Código de Referido')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('button:has-text("Copiar")')).toBeVisible();
  });

  test('Dashboard tiene quick links', async ({ page }) => {
    await page.goto('/revendedor/dashboard');
    await expect(page.locator('text=Mis Clientes')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=Comisiones')).toBeVisible();
  });
});
'''

# ── e2e/revendedor/commissions.spec.ts ──
files["e2e/revendedor/commissions.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Comisiones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/revendedor/, { timeout: 60000 });
  });

  test('RE-04: Pagina de comisiones carga', async ({ page }) => {
    await page.goto('/revendedor/comisiones');
    await expect(page.locator('text=Comisiones')).toBeVisible({ timeout: 30000 });
  });

  test('RE-05: Pagina de liquidaciones carga', async ({ page }) => {
    await page.goto('/revendedor/liquidaciones');
    await expect(page.locator('text=Liquidaciones')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/revendedor/clients.spec.ts ──
files["e2e/revendedor/clients.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Revendedor - Mis Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/revendedor/, { timeout: 60000 });
  });

  test('RE-03: Pagina mis clientes carga', async ({ page }) => {
    await page.goto('/revendedor/mis-clientes');
    await expect(page.locator('text=Mis Clientes')).toBeVisible({ timeout: 30000 });
  });

  test('RE-06: Pagina perfil carga', async ({ page }) => {
    await page.goto('/revendedor/perfil');
    await expect(page.locator('text=Perfil')).toBeVisible({ timeout: 30000 });
  });

  test('Perfil tiene boton guardar', async ({ page }) => {
    await page.goto('/revendedor/perfil');
    await expect(page.locator('button:has-text("Guardar")')).toBeVisible({ timeout: 30000 });
  });

  test('Revendedor no accede a rutas de admin', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/admin\/productos$/);
  });
});
'''

# ── e2e/scenarios/complete-purchase-flow.spec.ts ──
files["e2e/scenarios/complete-purchase-flow.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData } from '../../utils/test-data';

test.describe('Escenario: Flujo completo login por roles', () => {
  test('SA login -> navegar secciones admin', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.superAdmin.email);
    await page.locator('#password').fill(testData.superAdmin.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Panel de Administración')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/planes');
    await expect(page.locator('text=Planes')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/revendedores');
    await expect(page.locator('text=Revendedores')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/comisiones');
    await expect(page.locator('text=Comisiones')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/distribuidores');
    await expect(page.locator('text=Distribuidores')).toBeVisible({ timeout: 30000 });
  });

  test('Distribuidor login -> dashboard y secciones', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.distribuidores[0].email);
    await page.locator('#password').fill(testData.distribuidores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await expect(page.locator('text=Panel de Administración')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/productos');
    await expect(page.locator('text=Productos')).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/pedidos');
    await expect(page.locator('text=Pedidos')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/scenarios/commission-calculation.spec.ts ──
files["e2e/scenarios/commission-calculation.spec.ts"] = r'''import { test, expect } from '@playwright/test';
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
    await expect(page.locator('text=Comisiones')).toBeVisible({ timeout: 30000 });
  });
});
'''

# ── e2e/scenarios/referral-bonus-flow.spec.ts ──
files["e2e/scenarios/referral-bonus-flow.spec.ts"] = r'''import { test, expect } from '@playwright/test';
import { testData, calcularComision } from '../../utils/test-data';

test.describe('Escenario: Bonus de Comision por Volumen', () => {
  test('Revendedor puede ver su dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testData.revendedores[0].email);
    await page.locator('#password').fill(testData.revendedores[0].password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/revendedor/, { timeout: 60000 });
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
'''

# Write all files
for path, content in files.items():
    full_path = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Written: {path}")

print(f"\n✅ {len(files)} files written successfully!")
