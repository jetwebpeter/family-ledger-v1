'use strict';
const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// 整體累計結餘（含期初轉入）
function openingTotal() {
  const c = db.prepare(
    'SELECT COALESCE(SUM(opening_income),0) i, COALESCE(SUM(opening_expense),0) e FROM carryovers'
  ).get();
  return c.i - c.e;
}

// 摘要：?month=YYYY-MM 或不帶（全部）
router.get('/summary', requireAuth, (req, res) => {
  const { month } = req.query;
  let where = '', args = [];
  if (month) { where = 'WHERE date LIKE ?'; args = [`${month}%`]; }
  const t = db.prepare(
    `SELECT COALESCE(SUM(income),0) income, COALESCE(SUM(expense),0) expense,
            COUNT(*) count FROM entries ${where}`
  ).get(...args);

  // 全部累計結餘（到該月底為止）
  let cumWhere = '', cumArgs = [];
  if (month) { cumWhere = 'WHERE date <= ?'; cumArgs = [`${month}-31`]; }
  const cum = db.prepare(
    `SELECT COALESCE(SUM(income),0)-COALESCE(SUM(expense),0) net FROM entries ${cumWhere}`
  ).get(...cumArgs);

  res.json({
    income: t.income,
    expense: t.expense,
    balance: t.income - t.expense,
    count: t.count,
    cumulativeBalance: cum.net + openingTotal(),
  });
});

// 用途分類（支出）：?month=YYYY-MM
router.get('/by-purpose', requireAuth, (req, res) => {
  const { month } = req.query;
  let where = 'WHERE expense > 0', args = [];
  if (month) { where += ' AND date LIKE ?'; args = [`${month}%`]; }
  const rows = db.prepare(
    `SELECT COALESCE(p.zh, NULLIF(e.purpose,''), '—') purpose, SUM(e.expense) total
     FROM entries e LEFT JOIN phrases p ON p.id=e.phrase_id
     ${where} GROUP BY COALESCE(p.id, NULLIF(e.purpose,''), '—') ORDER BY total DESC`
  ).all(...args);
  res.json(rows);
});

// 月趨勢：近 N 個月收入/支出
router.get('/trend', requireAuth, (req, res) => {
  const months = Math.min(parseInt(req.query.months) || 6, 24);
  const rows = db.prepare(
    `SELECT substr(date,1,7) ym,
            COALESCE(SUM(income),0) income,
            COALESCE(SUM(expense),0) expense
     FROM entries GROUP BY ym ORDER BY ym DESC LIMIT ?`
  ).all(months);
  res.json(rows.reverse());
});

module.exports = router;
