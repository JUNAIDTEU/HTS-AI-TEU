<<<<<<< Updated upstream
// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
=======
// Express server for Render: serves API, database, and static frontend
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import initializeDatabase from './services/database.js';

>>>>>>> Stashed changes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

<<<<<<< Updated upstream
// Example API
import apiRoutes from "./api.js";
app.use("/api", apiRoutes);
=======
// Serve static files from the dist directory after building
app.use(express.static(path.join(__dirname, 'dist')));
let db;

// Initialize database
const initDb = async () => {
  db = await initializeDatabase();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// API routes
app.use('/api', require('./api'));
app.use('/api', require('./api/userPreferences'));

// Rate limiting for API routes
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter);
>>>>>>> Stashed changes

// Serve frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

<<<<<<< Updated upstream
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
=======
// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());

// Database API endpoints
app.get('/api/chat/history', async (req, res) => {
  try {
    const history = await db.all('SELECT * FROM ChatHistory ORDER BY timestamp DESC');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const { id, role, content } = req.body;
    await db.run('INSERT INTO ChatHistory (id, role, content) VALUES (?, ?, ?)', 
      [id, role, content]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/chat/history', async (req, res) => {
  try {
    await db.run('DELETE FROM ChatHistory');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTS Code endpoints
app.get('/api/hts/expired', async (req, res) => {
  try {
    const codes = await db.all('SELECT * FROM HTSCodes WHERE isExpired = 1');
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hts/expire', async (req, res) => {
  try {
    const { code } = req.body;
    await db.run('INSERT OR REPLACE INTO HTSCodes (code, isExpired) VALUES (?, 1)', [code]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/hts/expire/:code', async (req, res) => {
  try {
    await db.run('DELETE FROM HTSCodes WHERE code = ?', [req.params.code]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Response management endpoints
app.get('/api/responses/correct', async (req, res) => {
  try {
    const responses = await db.all('SELECT * FROM CorrectResponses');
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/responses/correct', async (req, res) => {
  try {
    const { key, response } = req.body;
    await db.run('INSERT OR REPLACE INTO CorrectResponses (key, response) VALUES (?, ?)', 
      [key, JSON.stringify(response)]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/responses/correct/:key', async (req, res) => {
  try {
    await db.run('DELETE FROM CorrectResponses WHERE key = ?', [req.params.key]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/responses/incorrect', async (req, res) => {
  try {
    const responses = await db.all('SELECT * FROM IncorrectResponses');
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/responses/incorrect', async (req, res) => {
  try {
    const { input, response } = req.body;
    await db.run('INSERT INTO IncorrectResponses (userInput, botResponse) VALUES (?, ?)', 
      [input, response]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/responses/incorrect/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM IncorrectResponses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Block list management
app.get('/api/blocklist', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM BlockList ORDER BY timestamp DESC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blocklist', async (req, res) => {
  try {
    const { item, reason } = req.body;
    await db.run('INSERT INTO BlockList (item, reason) VALUES (?, ?)', [item, reason]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/blocklist/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM BlockList WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database management endpoints
app.get('/api/database/stats', async (req, res) => {
  try {
    const stats = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM ChatHistory'),
      db.get('SELECT COUNT(*) as count FROM HTSCodes WHERE isExpired = 1'),
      db.get('SELECT COUNT(*) as count FROM CorrectResponses'),
      db.get('SELECT COUNT(*) as count FROM IncorrectResponses'),
      db.get('SELECT COUNT(*) as count FROM BlockList')
    ]);

    res.json({
      chatMessages: stats[0].count,
      expiredCodes: stats[1].count,
      correctResponses: stats[2].count,
      incorrectResponses: stats[3].count,
      blockedItems: stats[4].count,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/database/backup', async (req, res) => {
  try {
    // Create a backup of the database file
    const backupPath = path.join(__dirname, `backups/botMemory_${Date.now()}.db`);
    await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.promises.copyFile('./botMemory.db', backupPath);
    res.json({ success: true, backupPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/database/reset', async (req, res) => {
  try {
    await db.exec(`
      DELETE FROM ChatHistory;
      DELETE FROM HTSCodes;
      DELETE FROM CorrectResponses;
      DELETE FROM IncorrectResponses;
      DELETE FROM BlockList;
      DELETE FROM AdminSettings;
    `);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database endpoints
app.get('/api/history', async (req, res) => {
  try {
    const history = await db.all('SELECT * FROM SearchHistory ORDER BY timestamp DESC');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const { query } = req.body;
    await db.run('INSERT INTO SearchHistory (query) VALUES (?)', query);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/htscodes/:code', async (req, res) => {
  try {
    const result = await db.get('SELECT * FROM HTSCodes WHERE code = ?', req.params.code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/htscodes/:code/expire', async (req, res) => {
  try {
    await db.run('UPDATE HTSCodes SET isExpired = 1 WHERE code = ?', req.params.code);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin settings table
app.post('/api/admin/settings', async (req, res) => {
  try {
    const { setting, value } = req.body;
    await db.run(
      'INSERT OR REPLACE INTO AdminSettings (setting, value) VALUES (?, ?)',
      [setting, JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await db.all('SELECT * FROM AdminSettings');
    const parsedSettings = settings.reduce((acc, { setting, value }) => {
      acc[setting] = JSON.parse(value);
      return acc;
    }, {});
    res.json(parsedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Access from other machines using your IP address');
  });
>>>>>>> Stashed changes
});
