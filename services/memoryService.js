import initializeDatabase from './database';

// Function to store a search query
export const storeSearchQuery = async (query) => {
  const db = await initializeDatabase();
  await db.run('INSERT INTO SearchHistory (query) VALUES (?)', query);
};

// Function to retrieve past searches
export const getSearchHistory = async () => {
  const db = await initializeDatabase();
  const history = await db.all('SELECT * FROM SearchHistory ORDER BY timestamp DESC');
  return history;
};

// Function to mark an HTS code as expired
export const markHTSCodeAsExpired = async (code) => {
  const db = await initializeDatabase();
  await db.run('UPDATE HTSCodes SET isExpired = 1 WHERE code = ?', code);
};

// Function to check if an HTS code is expired
export const isHTSCodeExpired = async (code) => {
  const db = await initializeDatabase();
  const result = await db.get('SELECT isExpired FROM HTSCodes WHERE code = ?', code);
  return result ? result.isExpired === 1 : false;
};