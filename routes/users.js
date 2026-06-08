'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', adminOnly, (_req, res) => {
  res.json(db.prepare('SELECT id,username,display_name,role,created_at FROM users ORDER BY id').all());
});

router.post('/', adminOnly, (req, res) => {
  const { username, password, display_name, role } = req.body || {};
  // 暱稱即登入帳號（唯一）
  const name = String(display_name || username || '').trim();
  if (!name || !password) return res.status(400).json({ error: 'missing' });
  if (!['admin', 'editor', 'reader'].includes(role))
    return res.status(400).json({ error: 'bad_role' });
  if (db.prepare('SELECT 1 FROM users WHERE username=?').get(name))
    return res.status(409).json({ error: 'exists' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    'INSERT INTO users(username,password_hash,display_name,role) VALUES (?,?,?,?)'
  ).run(name, hash, name, role);
  res.json({ id: info.lastInsertRowid, username: name, display_name: name, role });
});

// 改暱稱 / 重設密碼 / 改角色
router.put('/:id', adminOnly, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'not_found' });
  const { password, role, display_name } = req.body || {};
  if (display_name != null) {
    const name = String(display_name).trim();
    if (name && name !== u.username) {
      if (db.prepare('SELECT 1 FROM users WHERE username=? AND id<>?').get(name, u.id))
        return res.status(409).json({ error: 'exists' });
      db.prepare('UPDATE users SET username=?, display_name=? WHERE id=?').run(name, name, u.id);
    }
  }
  if (password) db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(password, 10), u.id);
  if (role && ['admin', 'editor', 'reader'].includes(role))
    db.prepare('UPDATE users SET role=? WHERE id=?').run(role, u.id);
  res.json({ ok: true });
});

router.delete('/:id', adminOnly, (req, res) => {
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'cannot_delete_self' });
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
