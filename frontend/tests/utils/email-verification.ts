interface MailHogMessage {
  ID: string;
  From: { Relays: null; Mailbox: string; Domain: string; Params: string };
  To: Array<{ Relays: null; Mailbox: string; Domain: string; Params: string }>;
  Content: {
    Headers: Record<string, string[]>;
    Body: string;
    Size: number;
  };
  Created: string;
  MIME: null;
  Raw: { From: string; To: string[]; Data: string; Helo: string };
}

interface MailHogSearchResult {
  total: number;
  count: number;
  start: number;
  items: MailHogMessage[];
}

const MAILHOG_URL = process.env.MAILHOG_URL || 'http://localhost:8025';

export async function getLatestEmail(to: string): Promise<MailHogMessage | null> {
  const res = await fetch(`${MAILHOG_URL}/api/v2/search?kind=to&query=${encodeURIComponent(to)}`);
  const data: MailHogSearchResult = await res.json();
  if (data.items.length === 0) return null;
  return data.items.sort(
    (a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime()
  )[0];
}

export async function getEmailsBySubject(subject: string): Promise<MailHogMessage[]> {
  const res = await fetch(
    `${MAILHOG_URL}/api/v2/search?kind=containing&query=${encodeURIComponent(subject)}`
  );
  const data: MailHogSearchResult = await res.json();
  return data.items;
}

export async function getAllEmails(): Promise<MailHogMessage[]> {
  const res = await fetch(`${MAILHOG_URL}/api/v2/messages`);
  const data: MailHogSearchResult = await res.json();
  return data.items;
}

export function verifyEmailContent(
  email: MailHogMessage,
  expected: { subject?: string; bodyContains?: string[]; from?: string }
): boolean {
  if (expected.subject) {
    const subjects = email.Content.Headers['Subject'] || [];
    if (!subjects.some((s) => s.includes(expected.subject!))) return false;
  }
  if (expected.from) {
    const fromHeaders = email.Content.Headers['From'] || [];
    if (!fromHeaders.some((f) => f.includes(expected.from!))) return false;
  }
  if (expected.bodyContains) {
    const body = email.Content.Body;
    for (const text of expected.bodyContains) {
      if (!body.includes(text)) return false;
    }
  }
  return true;
}

export function extractLinkFromEmail(email: MailHogMessage, pattern: RegExp): string | null {
  const body = email.Content.Body;
  const match = body.match(pattern);
  return match ? match[0] : null;
}

export async function waitForEmail(
  to: string,
  timeout = 15000,
  interval = 1000
): Promise<MailHogMessage> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const email = await getLatestEmail(to);
    if (email) return email;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`No email received for ${to} within ${timeout}ms`);
}

export async function clearAllEmails(): Promise<void> {
  await fetch(`${MAILHOG_URL}/api/v1/messages`, { method: 'DELETE' });
}

export async function deleteEmail(id: string): Promise<void> {
  await fetch(`${MAILHOG_URL}/api/v1/messages/${id}`, { method: 'DELETE' });
}
