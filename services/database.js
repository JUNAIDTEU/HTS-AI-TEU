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

    CREATE TABLE IF NOT EXISTS AdminSettings (
      setting TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS BlockList (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL UNIQUE,
      reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS CorrectResponses (
      key TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS IncorrectResponses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userInput TEXT NOT NULL,
      botResponse TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ChatHistory (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};

export default initializeDatabase;