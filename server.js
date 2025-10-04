// server.js
import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import initializeDatabase from "./services/database.js";
import apiRoutes from "./api/index.js";
import userPreferences from "./api/userPreferences.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
let db;

// Initialize database
const initDb = async () => {
  db = await initializeDatabase();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (for all API routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
app.use("/api", limiter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// API routes
app.use("/api", apiRoutes);
app.use("/api/userPreferences", userPreferences);

// --- Database API endpoints ---
app.get("/api/chat/history", async (req, res) => {
  try {
    const history = await db.all("SELECT * FROM ChatHistory ORDER BY timestamp DESC");
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/message", async (req, res) => {
  try {
    const { id, role, content } = req.body;
    await db.run(
      "INSERT INTO ChatHistory (id, role, content) VALUES (?, ?, ?)",
      [id, role, content]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/chat/history", async (req, res) => {
  try {
    await db.run("DELETE FROM ChatHistory");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- HTS Code endpoints ---
app.get("/api/hts/expired", async (req, res) => {
  try {
    const codes = await db.all("SELECT * FROM HTSCodes WHERE isExpired = 1");
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/hts/expire", async (req, res) => {
  try {
    const { code } = req.body;
    await db.run(
      "INSERT OR REPLACE INTO HTSCodes (code, isExpired) VALUES (?, 1)",
      [code]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/hts/expire/:code", async (req, res) => {
  try {
    await db.run("DELETE FROM HTSCodes WHERE code = ?", [req.params.code]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Admin settings ---
app.post("/api/admin/settings", async (req, res) => {
  try {
    const { setting, value } = req.body;
    await db.run(
      "INSERT OR REPLACE INTO AdminSettings (setting, value) VALUES (?, ?)",
      [setting, JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/settings", async (req, res) => {
  try {
    const settings = await db.all("SELECT * FROM AdminSettings");
    const parsedSettings = settings.reduce((acc, { setting, value }) => {
      acc[setting] = JSON.parse(value);
      return acc;
    }, {});
    res.json(parsedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Start Server ---
initDb().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
    console.log("Access from other devices using your local IP.");
  });
});
