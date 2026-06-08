'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, DATA_DIR } = require('../db');
const { requireAuth, canWrite } = require('../middleware/auth');

const router = express.Router();

// ---- 收據上傳設定 ----
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// 取得明細（可帶 from / to / q 篩選）
router.get('/', requireAuth, (req, res) => {
  const { from, to, q } = req.query;
  const where = [];
  const args = [];
  if (from) { where.push('e.date >= ?'); args.push(from); }
  if (to)   { where.push('e.date <= ?'); args.push(to); }
  if (q)    { where.push('(e.purpose LIKE ? OR e.note LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  const sql = `
    SELECT e.*, u.display_name AS recorder
    FROM entries e LEFT JOIN users u ON u.id = e.recorder_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY e.date DESC, e.id DESC`;
  res.json(db.prepare(sql).all(...args));
});

// 新增
router.post('/', requireAuth, canWrite, upload.single('receipt'), (req, res) => {
  const { date, purpose, income, expense, note } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date_required' });
  const receipt_path = req.file ? `uploads/${req.file.filename}` : null;
  const info = db.prepare(
    `INSERT INTO entries(date,purpose,income,expense,note,receipt_path,recorder_id)
     VALUES (?,?,?,?,?,?,?)`
  ).run(date, purpose || '', num(income), num(expense), note || '', receipt_path, req.user.id);
  res.json(db.prepare('SELECT * FROM entries WHERE id=?').get(info.lastInsertRowid));
});

// 修改
router.put('/:id', requireAuth, canWrite, upload.single('receipt'), (req, res) => {
  const row = db.prepare('SELECT * FROM entries WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  const { date, purpose, income, expense, note } = req.body || {};
  let receipt_path = row.receipt_path;
  if (req.file) receipt_path = `uploads/${req.file.filename}`;
  db.prepare(
    `UPDATE entries SET date=?,purpose=?,income=?,expense=?,note=?,receipt_path=? WHERE id=?`
  ).run(
    date || row.date, purpose ?? row.purpose,
    num(income), num(expense), note ?? row.note, receipt_path, req.params.id
  );
  res.json(db.prepare('SELECT * FROM entries WHERE id=?').get(req.params.id));
});

// 刪除
router.delete('/:id', requireAuth, canWrite, (req, res) => {
  const row = db.prepare('SELECT * FROM entries WHERE id=?').get(req.params.id);
  if (row && row.receipt_path) {
    const fp = path.join(DATA_DIR, row.receipt_path);
    fs.existsSync(fp) && fs.unlinkSync(fp);
  }
  db.prepare('DELETE FROM entries WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = { router, UPLOAD_DIR };
