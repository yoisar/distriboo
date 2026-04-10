async function globalSetup() {
  console.log('Global setup: checking services...');
  try {
    const res = await fetch('http://localhost:8000/api/planes');
    if (res.ok) console.log('Backend API is reachable');
    else console.warn('Backend API returned:', res.status);
  } catch {
    console.warn('Backend API not reachable at localhost:8000');
  }
  try {
    await fetch('http://localhost:8025/api/v1/messages', { method: 'DELETE' });
    console.log('MailHog cleared');
  } catch {
    console.warn('MailHog not available');
  }
}
export default globalSetup;
