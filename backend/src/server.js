require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const appRoutes = require('./routes/apps');
const dataRoutes = require('./routes/data');
const uploadRoutes = require('./routes/upload');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/apps', authMiddleware, appRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
module.exports = app;