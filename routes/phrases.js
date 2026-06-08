'use strict';
const express = require('express');
const { db } = require('../db');
const { requireAuth, canWrite } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM phrases ORDER BY sort, id').all());
});

router.post('/', requireAuth, canWrite, (req, res) => {
  const { zh, id_text, en } = req.body || {};
  if (!zh && !id_text && !en) return res.status(400).json({ error: 'empty' });
  const sort = db.prepare('SELECT COALESCE(MAX(sort),0)+1 s FROM phrases').get().s;
  const info = db.prepare(
    'INSERT INTO phrases(zh,id_text,en,sort) VALUES (?,?,?,?)'
  ).run(zh || '', id_text || '', en || '', sort);
  res.json(db.prepare('SELECT * FROM phrases WHERE id=?').get(info.lastInsertRowid));
});

router.delete('/:id', requireAuth, canWrite, (req, res) => {
  db.prepare('DELETE FROM phrases WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
