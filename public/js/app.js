// app.js
import { api } from './api.js';
import { t, getLang, setLang, LANGS } from './i18n.js';
import { state, ICON, toast } from './ui.js';
import * as V from './views.js';

const $app = document.getElementById('app');

// 全域看圖
window.__viewImg = (src) => {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.style.alignItems = 'center';
  bg.innerHTML = `<img src="${src}" style="max-width:92%;max-height:88%;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.4)">`;
  bg.onclick = () => bg.remove();
  document.body.appendChild(bg);
};

window.addEventListener('unauthorized', () => { state.user = null; renderLogin(); });

const TABS = [
  { id: 'dashboard', icon: 'dash', label: 'nav.dashboard' },
  { id: 'list', icon: 'list', label: 'nav.list' },
  { id: 'add', icon: 'add', label: 'nav.add' },
  { id: 'report', icon: 'report', label: 'nav.report' },
  { id: 'settings', icon: 'cog', label: 'nav.settings' },
];

function shell() {
  const tabs = TABS.filter((tb) => !(tb.id === 'add' && state.user.role === 'reader'));
  $app.innerHTML = `
    <header class="appbar">
      <div class="brand"><span class="logo">${ICON.wallet}</span><span>${state.settings.app_name || t('app.title')}</span></div>
      <span class="spacer"></span>
      <select class="langsel" id="lang">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${getLang() === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="iconbtn" id="logout" title="${t('c.logout')}">${ICON.logout}</button>
    </header>
    <main id="main"></main>
    <nav class="tabbar">
      ${tabs.map((tb) => `<button class="tab" data-tab="${tb.id}">
        <span class="tabic">${ICON[tb.icon]}</span><span>${t(tb.label)}</span></button>`).join('')}
    </nav>`;
  document.getElementById('lang').onchange = (e) => { setLang(e.target.value); location.reload(); };
  document.getElementById('logout').onclick = async () => { await api.logout(); state.user = null; renderLogin(); };
  $app.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { location.hash = '#/' + b.dataset.tab; });
}

async function route() {
  if (!state.user) return;
  const hash = location.hash.replace(/^#\//, '') || 'dashboard';
  const [page, arg] = hash.split('/');
  const main = document.getElementById('main');
  if (!main) { shell(); return route(); }

  // active tab
  const activeTab = page === 'edit' ? 'list' : page;
  $app.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === activeTab));

  try {
    if (page === 'dashboard') await V.dashboard(main);
    else if (page === 'list') await V.list(main);
    else if (page === 'add') await V.addEntry(main);
    else if (page === 'edit') await V.addEntry(main, Number(arg));
    else if (page === 'report') await V.report(main);
    else if (page === 'settings') await V.settings(main);
    else { location.hash = '#/dashboard'; }
    main.scrollTo && window.scrollTo(0, 0);
  } catch (e) {
    if (e.message !== 'unauthorized') main.innerHTML = `<div class="view"><div class="empty">⚠ ${e.message}</div></div>`;
  }
}
window.addEventListener('hashchange', route);

/* ===== Login ===== */
function renderLogin() {
  $app.innerHTML = `<div class="login view">
    <div class="logo-lg">${ICON.wallet}</div>
    <h1>${state.settings.app_name || t('app.title')}</h1>
    <p class="sub">${t('login.subtitle')}</p>
    <div id="err"></div>
    <div class="field"><label>${t('login.username')}</label><input class="input" id="lg-u" autocomplete="username"></div>
    <div class="field"><label>${t('login.password')}</label><input class="input" id="lg-p" type="password" autocomplete="current-password"></div>
    <button class="btn" id="lg-go" style="margin-top:6px">${t('login.submit')}</button>
    <div style="margin-top:20px;text-align:center">
      <select class="langsel" id="lg-lang">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${getLang() === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    </div>
  </div>`;
  const go = async () => {
    const u = document.getElementById('lg-u').value.trim();
    const p = document.getElementById('lg-p').value;
    try {
      state.user = await api.login(u, p);
      await boot();
    } catch (e) {
      document.getElementById('err').innerHTML = `<div class="err">${t('login.error')}</div>`;
    }
  };
  document.getElementById('lg-go').onclick = go;
  document.getElementById('lg-p').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  document.getElementById('lg-lang').onchange = (e) => { setLang(e.target.value); location.reload(); };
}

/* ===== Boot ===== */
async function loadSettings() {
  try { state.settings = await api.settings(); state.currency = state.settings.currency || 'NT$'; } catch (_) {}
}
async function boot() {
  await loadSettings();
  shell();
  if (!location.hash || location.hash === '#/') location.hash = '#/dashboard';
  else route();
  route();
}

async function init() {
  state.lang = getLang();
  // 先取公開設定（含 app 名稱/語系）供登入頁顯示
  try { state.settings = await api.publicSettings(); } catch (_) {}
  if (state.settings && state.settings.default_language && !localStorage.getItem('lang')) setLang(state.settings.default_language);
  try {
    state.user = await api.me();
    await boot();
  } catch (_) {
    renderLogin();
  }
}
init();
