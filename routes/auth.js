'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { sign, setAuthCookie, clearAuthCookie, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'missing_credentials' });
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(String(username).trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'invalid_credentials' });
  setAuthCookie(res, sign(user));
  res.json({ id: user.id, username: user.username, name: user.display_name, role: user.role });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, name: req.user.name, role: req.user.role });
});

module.exports = router;
