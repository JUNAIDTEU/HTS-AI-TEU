const express = require('express');
const router = express.Router();
const { verifyAuthToken } = require('./authMiddleware');

// In-memory store for user preferences (replace with database in production)
const userPreferences = new Map();

// Get user preferences
router.get('/preferences', verifyAuthToken, (req, res) => {
  const userId = req.user.id;
  const preferences = userPreferences.get(userId) || {};
  res.json(preferences);
});

// Update user preferences
router.post('/preferences', verifyAuthToken, (req, res) => {
  const userId = req.user.id;
  const newPreferences = req.body;

  // Validate preferences
  if (!newPreferences || typeof newPreferences !== 'object') {
    return res.status(400).json({ error: 'Invalid preferences format' });
  }

  // Merge with existing preferences
  const existingPreferences = userPreferences.get(userId) || {};
  const updatedPreferences = {
    ...existingPreferences,
    ...newPreferences,
  };

  // Store preferences
  userPreferences.set(userId, updatedPreferences);

  res.json(updatedPreferences);
});

// Delete user preferences
router.delete('/preferences', verifyAuthToken, (req, res) => {
  const userId = req.user.id;
  userPreferences.delete(userId);
  res.status(204).send();
});

module.exports = router;