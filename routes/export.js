'use strict';
const express = require('express');
const XLSX = require('xlsx');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/xlsx', requireAuth, (req, res) => {
  const { from, to } = req.query;
  const lang = ['zh', 'en', 'id'].includes(req.query.lang) ? req.query.lang : 'zh';
  const where = [];
  const args = [];
  if (from) { where.push('e.date >= ?'); args.push(from); }
  if (to)   { where.push('e.date <= ?'); args.push(to); }
  const rows = db.prepare(
    `SELECT e.date, e.purpose, e.phrase_id, p.zh, p.en, p.id_text,
            e.income, e.expense, e.note, u.display_name recorder
     FROM entries e
     LEFT JOIN users u ON u.id=e.recorder_id
     LEFT JOIN phrases p ON p.id=e.phrase_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY e.date ASC, e.id ASC`
  ).all(...args);

  // 分類：選定的常用片語以指定語言顯示（跨語言一致）；手動輸入則用原文字
  const category = (r) => {
    if (r.phrase_id) {
      if (lang === 'en') return r.en || r.zh || r.id_text || '';
      if (lang === 'id') return r.id_text || r.zh || r.en || '';
      return r.zh || r.id_text || r.en || '';
    }
    return r.purpose || '';
  };

  // 計算累計結餘
  let bal = 0;
  const data = rows.map((r) => {
    bal += (r.income || 0) - (r.expense || 0);
    return {
      日期: r.date,
      用途: category(r),
      收入: r.income,
      支出: r.expense,
      結餘: bal,
      記帳者: r.recorder || '',
      備註: r.note,
    };
  });

  const totalIncome = rows.reduce((s, r) => s + (r.income || 0), 0);
  const totalExpense = rows.reduce((s, r) => s + (r.expense || 0), 0);
  data.push({});
  data.push({ 日期: '合計', 收入: totalIncome, 支出: totalExpense, 結餘: totalIncome - totalExpense });

  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['日期', '用途', '收入', '支出', '結餘', '記帳者', '備註'],
  });
  ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 24 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '記帳明細');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const fname = `ledger_${from || 'all'}_${to || 'all'}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
  res.send(buf);
});

module.exports = router;
