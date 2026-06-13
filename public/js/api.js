// api.js
const API_BASE_URL = window.API_BASE_URL || '';

async function req(url, opts = {}) {
  const res = await fetch(API_BASE_URL + url, { credentials: 'same-origin', ...opts });
  if (res.status === 401) { window.dispatchEvent(new Event('unauthorized')); throw new Error('unauthorized'); }
  if (!res.ok) {
    let e = {}; try { e = await res.json(); } catch (_) {}
    throw new Error(e.error || res.statusText);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res;
}
const json = (m, b) => ({ method: m, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });

export const api = {
  // auth
  login: (username, password) => req('/api/auth/login', json('POST', { username, password })),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  me: () => req('/api/auth/me'),
  // entries
  entries: (params = {}) => req('/api/entries?' + new URLSearchParams(params)),
  addEntry: (fd) => req('/api/entries', { method: 'POST', body: fd }),
  updateEntry: (id, fd) => req('/api/entries/' + id, { method: 'PUT', body: fd }),
  delEntry: (id) => req('/api/entries/' + id, { method: 'DELETE' }),
  // dashboard
  summary: (month) => req('/api/dashboard/summary?' + new URLSearchParams(month ? { month } : {})),
  byPurpose: (month) => req('/api/dashboard/by-purpose?' + new URLSearchParams(month ? { month } : {})),
  trend: (months = 6) => req('/api/dashboard/trend?' + new URLSearchParams({ months })),
  // phrases
  phrases: () => req('/api/phrases'),
  addPhrase: (b) => req('/api/phrases', json('POST', b)),
  delPhrase: (id) => req('/api/phrases/' + id, { method: 'DELETE' }),
  // users
  users: () => req('/api/users'),
  addUser: (b) => req('/api/users', json('POST', b)),
  updateUser: (id, b) => req('/api/users/' + id, json('PUT', b)),
  delUser: (id) => req('/api/users/' + id, { method: 'DELETE' }),
  // settings
  publicSettings: () => req('/api/settings/public'),
  settings: () => req('/api/settings'),
  saveSettings: (b) => req('/api/settings', json('PUT', b)),
  carryovers: () => req('/api/settings/carryovers'),
  saveCarryover: (year, b) => req('/api/settings/carryovers/' + year, json('PUT', b)),
  delCarryover: (year) => req('/api/settings/carryovers/' + year, { method: 'DELETE' }),
  exportUrl: (from, to, lang) => '/api/export/xlsx?' + new URLSearchParams({ from, to, ...(lang ? { lang } : {}) }),
};
