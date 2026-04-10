import { test as base, expect } from '@playwright/test';
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
