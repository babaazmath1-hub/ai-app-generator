const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/csv', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const { table } = req.body;
  if (!table) return res.status(400).json({ error: 'Table name required' });
  try {
    const parsed = Papa.parse(req.file.buffer.toString('utf-8'), { header: true, skipEmptyLines: true });
    const insert = db.prepare('INSERT INTO records (id, table_name, data) VALUES (?, ?, ?)');
    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(uuidv4(), table, JSON.stringify(row));
    });
    insertMany(parsed.data);
    res.json({ success: true, insertedCount: parsed.data.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;