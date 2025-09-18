import express from 'express';
import cors from 'cors';
import initializeDatabase from './services/database.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DB_PORT || 3001;

app.use(cors());
app.use(express.json());

let db;

// Initialize database connection
const init = async () => {
  db = await initializeDatabase();
};

init();

// Search History endpoints
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

// HTS Codes endpoints
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Database server running on http://0.0.0.0:${PORT}`);
});