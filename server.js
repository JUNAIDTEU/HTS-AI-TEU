// Express server for Render: serves API and static frontend
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API routes (example)
app.use('/api', require('./api'));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
