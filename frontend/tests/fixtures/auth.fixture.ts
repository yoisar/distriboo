import { test as base, Page } from '@playwright/test';
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
