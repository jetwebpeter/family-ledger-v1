'use strict';
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const COOKIE = 'fl_token';

function sign(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.display_name },
    SECRET,
    { expiresIn: '30d' }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 3600 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE);
}

// 解析 token（不強制），把 user 掛到 req.user
function parse(req, _res, next) {
  const token = req.cookies && req.cookies[COOKIE];
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch (_) {
      /* ignore */
    }
  }
  next();
}

// 必須登入
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  next();
}

// 需要特定角色（admin > editor > reader）
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// 可寫入（admin 或 editor）
const canWrite = requireRole('admin', 'editor');

module.exports = {
  SECRET, COOKIE, sign, setAuthCookie, clearAuthCookie,
  parse, requireAuth, requireRole, canWrite,
};
