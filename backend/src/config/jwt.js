const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const sign = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
const verify = (token) => { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } };

module.exports = { sign, verify, JWT_SECRET };