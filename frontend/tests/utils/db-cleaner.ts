const API_URL = process.env.API_URL || 'http://localhost:8000/api';

export async function resetDatabase(): Promise<void> {
  console.log('DB reset skipped - using persistent test data');
}

export async function truncateTestTables(): Promise<void> {
  console.log('Truncate skipped - using persistent test data');
}

export async function loadFixtures(): Promise<void> {
  console.log('Load fixtures skipped - using persistent test data');
}
