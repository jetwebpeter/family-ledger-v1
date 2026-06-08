'use strict';
const express = require('express');
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

// 公開設定：登入頁顯示用（僅非敏感欄位，免登入）
router.get('/public', (_req, res) => {
  const keys = ['app_name', 'default_language', 'currency'];
  const out = {};
  keys.forEach((k) => {
    const r = db.prepare('SELECT value FROM settings WHERE key=?').get(k);
    if (r) out[k] = r.value;
  });
  res.json(out);
});

// 一般設定：所有登入者可讀
router.get('/', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT key,value FROM settings').all();
  const out = {};
  rows.forEach((r) => (out[r.key] = r.value));
  res.json(out);
});

router.put('/', adminOnly, (req, res) => {
  const body = req.body || {};
  const up = db.prepare(
    'INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
  );
  Object.entries(body).forEach(([k, v]) => up.run(k, String(v)));
  res.json({ ok: true });
});

// ---- 年度期初轉入 ----
router.get('/carryovers', requireAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM carryovers ORDER BY year DESC').all());
});

router.put('/carryovers/:year', adminOnly, (req, res) => {
  const year = parseInt(req.params.year);
  if (!year) return res.status(400).json({ error: 'bad_year' });
  const { opening_income, opening_income_date, opening_expense, opening_expense_date } = req.body || {};
  db.prepare(
    `INSERT INTO carryovers(year,opening_income,opening_income_date,opening_expense,opening_expense_date)
     VALUES (?,?,?,?,?)
     ON CONFLICT(year) DO UPDATE SET
       opening_income=excluded.opening_income,
       opening_income_date=excluded.opening_income_date,
       opening_expense=excluded.opening_expense,
       opening_expense_date=excluded.opening_expense_date`
  ).run(
    year,
    parseFloat(opening_income) || 0, opening_income_date || null,
    parseFloat(opening_expense) || 0, opening_expense_date || null
  );
  res.json(db.prepare('SELECT * FROM carryovers WHERE year=?').get(year));
});

router.delete('/carryovers/:year', adminOnly, (req, res) => {
  db.prepare('DELETE FROM carryovers WHERE year=?').run(parseInt(req.params.year));
  res.json({ ok: true });
});

module.exports = router;
