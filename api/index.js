// Example API router for Render fullstack deployment
const express = require('express');
const router = express.Router();

// Example endpoint
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Add your backend endpoints here

module.exports = router;
