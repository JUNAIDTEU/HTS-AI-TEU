const jwt = require('jsonwebtoken');

// Replace with secure environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyAuthToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  verifyAuthToken
};