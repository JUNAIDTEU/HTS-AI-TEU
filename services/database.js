import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Initialize the database connection
const initializeDatabase = async () => {
  const db = await open({
    filename: './botMemory.db',
    driver: sqlite3.Database,
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS SearchHistory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS HTSCodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      isExpired BOOLEAN DEFAULT 0
    );
  `);

  return db;
};

export default initializeDatabase;