'use strict';

// 隱藏 node:sqlite 的 experimental 警告（功能正常，只是提示）
const _emit = process.emitWarning;
process.emitWarning = (w, ...a) => {
  if (typeof w === 'string' && w.includes('SQLite is an experimental')) return;
  return _emit.call(process, w, ...a);
};

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'ledger.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor', -- admin | editor | reader
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  date         TEXT NOT NULL,            -- YYYY-MM-DD
  purpose      TEXT NOT NULL DEFAULT '',
  income       REAL NOT NULL DEFAULT 0,
  expense      REAL NOT NULL DEFAULT 0,
  note         TEXT NOT NULL DEFAULT '',
  receipt_path TEXT,
  recorder_id  INTEGER REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

CREATE TABLE IF NOT EXISTS phrases (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  zh      TEXT NOT NULL DEFAULT '',
  id_text TEXT NOT NULL DEFAULT '',
  en      TEXT NOT NULL DEFAULT '',
  sort    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS carryovers (
  year                 INTEGER PRIMARY KEY,
  opening_income       REAL NOT NULL DEFAULT 0,
  opening_income_date  TEXT,
  opening_expense      REAL NOT NULL DEFAULT 0,
  opening_expense_date TEXT
);
`);

// ---- 種子資料 ----
function seed() {
  const n = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  if (n === 0) {
    const hash = bcrypt.hashSync('0912541540', 10);
    db.prepare(
      'INSERT INTO users(username,password_hash,display_name,role) VALUES (?,?,?,?)'
    ).run('admin', hash, 'Admin', 'admin');
  }

  const p = db.prepare('SELECT COUNT(*) c FROM phrases').get().c;
  if (p === 0) {
    const rows = [
      ['餐飲', 'Makanan', 'Food'],
      ['交通', 'Transportasi', 'Transport'],
      ['日用品', 'Kebutuhan harian', 'Daily goods'],
      ['水電瓦斯', 'Listrik & air', 'Utilities'],
      ['房租', 'Sewa rumah', 'Rent'],
      ['醫療', 'Kesehatan', 'Medical'],
      ['教育', 'Pendidikan', 'Education'],
      ['娛樂', 'Hiburan', 'Entertainment'],
      ['薪資', 'Gaji', 'Salary'],
      ['其他', 'Lainnya', 'Other'],
    ];
    const ins = db.prepare('INSERT INTO phrases(zh,id_text,en,sort) VALUES (?,?,?,?)');
    rows.forEach((r, i) => ins.run(r[0], r[1], r[2], i));
  }

  const setDefault = (k, v) => {
    if (!db.prepare('SELECT 1 FROM settings WHERE key=?').get(k))
      db.prepare('INSERT INTO settings(key,value) VALUES (?,?)').run(k, v);
  };
  setDefault('app_name', '家庭記帳本');
  setDefault('default_language', 'zh');
  setDefault('currency', 'NT$');
}
seed();

module.exports = { db, DATA_DIR };
