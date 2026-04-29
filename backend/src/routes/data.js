const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

router.get('/:table', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM records WHERE table_name = ? ORDER BY created_at DESC').all(req.params.table);
    const data = records.map(r => ({ id: r.id, ...JSON.parse(r.data), created_at: r.created_at }));
    res.json({ data, total: data.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:table', (req, res) => {
  try {
    const id = uuidv4();
    db.prepare('INSERT INTO records (id, table_name, data) VALUES (?, ?, ?)').run(id, req.params.table, JSON.stringify(req.body));
    res.status(201).json({ id, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:table/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM records WHERE id = ? AND table_name = ?').run(req.params.id, req.params.table);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;