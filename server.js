'use strict';
require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { DATA_DIR } = require('./db');
const auth = require('./middleware/auth');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth.parse);

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries').router);
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/phrases', require('./routes/phrases'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/export', require('./routes/export'));

// 收據圖片：需登入才能存取
app.use('/uploads', auth.requireAuth, express.static(path.join(DATA_DIR, 'uploads')));

// 靜態前端
const PUBLIC = path.join(__dirname, 'public');
app.use(express.static(PUBLIC));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`家庭記帳本 running on http://localhost:${PORT}`));
