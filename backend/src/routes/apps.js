const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  const apps = db.prepare('SELECT * FROM apps WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(apps);
});

router.post('/', (req, res) => {
  const { name, config } = req.body;
  if (!name || !config) return res.status(400).json({ error: 'Name and config required' });
  const id = uuidv4();
  db.prepare('INSERT INTO apps (id, user_id, name, config) VALUES (?, ?, ?, ?)').run(id, req.user.id, name, JSON.stringify(config));
  res.status(201).json({ id, name, config });
});

router.get('/:id', (req, res) => {
  const app = db.prepare('SELECT * FROM apps WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  app.config = JSON.parse(app.config);
  res.json(app);
});

module.exports = router;