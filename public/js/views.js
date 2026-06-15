// views.js
import { api } from './api.js';
import { t, getLang, setLang, LANGS, phraseLabel } from './i18n.js';
import { state, money, ICON, toast, modal, confirmDialog, todayStr, curMonth } from './ui.js';

const charts = {};
function killCharts() { Object.values(charts).forEach((c) => c && c.destroy()); }
const canWrite = () => state.user && (state.user.role === 'admin' || state.user.role === 'editor');
const isAdmin = () => state.user && state.user.role === 'admin';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ============ DASHBOARD ============ */
export async function dashboard(root) {
  killCharts();
  const month = curMonth();
  root.innerHTML = `<div class="view"><div class="spin"></div></div>`;
  const [sum, byP, tr] = await Promise.all([api.summary(month), api.byPurpose(month), api.trend(6)]);
  const recent = await api.entries({});

  root.innerHTML = `<div class="view stagger">
    <h1 class="view-title">${t('nav.dashboard')}</h1>
    <div class="card hero">
      <div class="label">${t('dash.cum')}</div>
      <div class="big num">${money(sum.cumulativeBalance)}</div>
      <div class="sub">
        <div>${t('dash.month')} ${t('c.income')}<b class="up num">${money(sum.income)}</b></div>
        <div>${t('dash.month')} ${t('c.expense')}<b class="dn num">${money(sum.expense)}</b></div>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat income"><div class="label"><span class="tag income"></span>${t('dash.net')}</div>
        <div class="val num">${money(sum.balance, true)}</div></div>
      <div class="stat"><div class="label">${month} · ${sum.count} ${t('dash.entries')}</div>
        <div class="val num" style="color:var(--primary)">${money(sum.cumulativeBalance)}</div></div>
    </div>
    <div class="card"><h3><span class="dot"></span>${t('dash.byPurpose')} · ${month}</h3>
      ${byP.length ? '<div class="chart-wrap"><canvas id="cPie"></canvas></div>' : `<div class="empty">${t('dash.noData')}</div>`}</div>
    <div class="card"><h3><span class="dot"></span>${t('dash.trend')}</h3>
      ${tr.length ? '<div class="chart-wrap"><canvas id="cBar"></canvas></div>' : `<div class="empty">${t('dash.noData')}</div>`}</div>
    <div class="card"><h3><span class="dot"></span>${t('nav.list')}</h3>
      <div id="recent"></div></div>
  </div>`;

  if (byP.length) {
    charts.pie = new Chart(document.getElementById('cPie'), {
      type: 'doughnut',
      data: { labels: byP.map((r) => r.purpose),
        datasets: [{ data: byP.map((r) => r.total),
          backgroundColor: ['#10705A', '#DC6B43', '#BE9637', '#5C8A74', '#C24B33', '#7A9A86', '#E0A05A', '#3F6B58', '#A8674A', '#9CA98E'],
          borderWidth: 2, borderColor: '#FFFDF7' }] },
      options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, boxWidth: 12 } } }, cutout: '58%' },
    });
  }
  if (tr.length) {
    charts.bar = new Chart(document.getElementById('cBar'), {
      type: 'bar',
      data: { labels: tr.map((r) => r.ym.slice(2)),
        datasets: [
          { label: t('c.income'), data: tr.map((r) => r.income), backgroundColor: '#10705A', borderRadius: 5, maxBarThickness: 16 },
          { label: t('c.expense'), data: tr.map((r) => r.expense), backgroundColor: '#DC6B43', borderRadius: 5, maxBarThickness: 16 },
        ] },
      options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: { y: { ticks: { font: { size: 10 } }, grid: { color: '#EFE7D6' } }, x: { grid: { display: false } } } },
    });
  }
  const rc = root.querySelector('#recent');
  rc.innerHTML = recent.slice(0, 6).map(entryRow).join('') || `<div class="empty">${t('dash.noData')}</div>`;
}

function entryRow(e) {
  const isInc = (e.income || 0) >= (e.expense || 0) && e.income > 0;
  const amt = e.income > 0 ? `<div class="amt inc num">${money(e.income, true)}</div>`
    : `<div class="amt exp num">${money(-e.expense, true)}</div>`;
  const init = (e.purpose || '—').slice(0, 1);
  return `<div class="entry">
    <div class="ava ${e.income > 0 ? 'inc' : 'exp'}">${esc(init)}</div>
    <div class="mid"><div class="p">${esc(e.purpose) || '—'}</div>
      <div class="m"><span>${e.date}</span>${e.recorder ? `<span>· ${esc(e.recorder)}</span>` : ''}${e.note ? `<span>· ${esc(e.note)}</span>` : ''}</div></div>
    ${e.receipt_path ? `<img class="thumb" src="/${e.receipt_path}" onclick="window.__viewImg('/${e.receipt_path}')">` : ''}
    ${amt}</div>`;
}

/* ============ ADD / EDIT ENTRY ============ */
export async function addEntry(root, editId) {
  const phrases = await api.phrases();
  let editing = null;
  if (editId) editing = (await api.entries({})).find((e) => e.id === editId);
  const cur = state.currency;
  // 選定的分類（連結片語）；手動輸入時為 null
  const editPhrase = editing && editing.phrase_id ? phrases.find((p) => p.id === editing.phrase_id) : null;
  let selectedPhraseId = editPhrase ? editPhrase.id : null;
  const purposeVal = editing ? (editPhrase ? phraseLabel(editPhrase) : (editing.purpose || '')) : '';
  root.innerHTML = `<div class="view">
    <h1 class="view-title">${editing ? t('c.edit') : t('nav.add')}</h1>
    <div class="card">
      <div class="field"><label>${t('c.date')}</label>
        <input class="input" type="date" id="f-date" value="${editing ? editing.date : todayStr()}"></div>

      <div class="field"><label>${t('c.purpose')}</label>
        <input class="input" id="f-purpose" placeholder="${t('entry.purposePlaceholder')}" value="${esc(purposeVal)}">
        <div class="chips" id="chips" style="margin-top:10px">
          ${phrases.map((p) => `<button class="chip ${selectedPhraseId === p.id ? 'on' : ''}" type="button" data-id="${p.id}" data-p="${esc(phraseLabel(p))}">${esc(phraseLabel(p))}</button>`).join('')}
        </div></div>

      <div class="amount-grid">
        <div class="field amt-input income"><label>${t('entry.incomeAmount')}</label>
          <span class="cur">${cur}</span>
          <input class="input" id="f-income" type="number" inputmode="decimal" min="0" step="0.01" value="${editing && editing.income ? editing.income : ''}" placeholder="0"></div>
        <div class="field amt-input expense"><label>${t('entry.expenseAmount')}</label>
          <span class="cur">${cur}</span>
          <input class="input" id="f-expense" type="number" inputmode="decimal" min="0" step="0.01" value="${editing && editing.expense ? editing.expense : ''}" placeholder="0"></div>
      </div>

      <div class="balance-preview"><span class="muted">${t('entry.balancePreview')}</span>
        <span class="v num" id="f-bal">${cur} 0</span></div>

      <div class="field"><label>${t('entry.receipt')} <span class="opt">(${t('c.optional')})</span></label>
        <label class="receipt-drop" for="f-receipt">
          <span class="ic">${ICON.cam}</span>
          <span id="f-receipt-label">${editing && editing.receipt_path ? t('list.receipt') : t('entry.attach')}</span>
          ${editing && editing.receipt_path ? `<img class="receipt-preview" style="margin-left:auto" src="/${editing.receipt_path}">` : ''}
        </label>
        <input id="f-receipt" type="file" accept="image/*" capture="environment" hidden></div>

      <div class="field"><label>${t('c.note')} <span class="opt">(${t('c.optional')})</span></label>
        <textarea class="input" id="f-note" placeholder="">${editing ? esc(editing.note) : ''}</textarea></div>

      <div class="field"><label>${t('c.recorder')}</label>
        <input class="input" value="${esc(state.user.name)}" disabled style="opacity:.7"></div>

      <button class="btn" id="f-save">${t('c.save')}</button>
    </div>
  </div>`;

  const inc = root.querySelector('#f-income');
  const exp = root.querySelector('#f-expense');
  const bal = root.querySelector('#f-bal');
  const upd = () => { bal.textContent = money((parseFloat(inc.value) || 0) - (parseFloat(exp.value) || 0), true); };
  inc.oninput = exp.oninput = upd; upd();

  root.querySelectorAll('.chip').forEach((c) => c.onclick = () => {
    root.querySelector('#f-purpose').value = c.dataset.p;
    selectedPhraseId = Number(c.dataset.id);
    root.querySelectorAll('.chip').forEach((x) => x.classList.remove('on'));
    c.classList.add('on');
  });
  // 手動修改文字 → 視為自訂分類，解除片語連結
  root.querySelector('#f-purpose').oninput = () => {
    selectedPhraseId = null;
    root.querySelectorAll('.chip').forEach((x) => x.classList.remove('on'));
  };
  const fileInput = root.querySelector('#f-receipt');
  fileInput.onchange = () => {
    if (fileInput.files[0]) root.querySelector('#f-receipt-label').textContent = fileInput.files[0].name;
  };

  root.querySelector('#f-save').onclick = async (ev) => {
    const btn = ev.currentTarget; btn.disabled = true;
    const fd = new FormData();
    fd.append('date', root.querySelector('#f-date').value);
    fd.append('purpose', root.querySelector('#f-purpose').value);
    fd.append('phrase_id', selectedPhraseId || '');
    fd.append('income', inc.value || 0);
    fd.append('expense', exp.value || 0);
    fd.append('note', root.querySelector('#f-note').value);
    if (fileInput.files[0]) fd.append('receipt', fileInput.files[0]);
    try {
      if (editing) await api.updateEntry(editing.id, fd); else await api.addEntry(fd);
      toast(t('entry.saved'));
      location.hash = '#/list';
    } catch (e) { toast(e.message); btn.disabled = false; }
  };
}

/* ============ LIST ============ */
export async function list(root) {
  root.innerHTML = `<div class="view">
    <h1 class="view-title">${t('nav.list')}</h1>
    <div class="card" style="padding:14px">
      <input class="input" id="q" placeholder="${t('c.search')}…" style="margin-bottom:10px">
      <input class="input" id="mon" type="month" value="">
    </div>
    <div class="card" id="rows"><div class="spin"></div></div>
  </div>`;
  const rows = root.querySelector('#rows');
  async function load() {
    const q = root.querySelector('#q').value.trim();
    const mon = root.querySelector('#mon').value;
    const params = {};
    if (q) params.q = q;
    if (mon) { params.from = mon + '-01'; params.to = mon + '-31'; }
    const data = await api.entries(params);
    if (!data.length) { rows.innerHTML = `<div class="empty">${t('list.empty')}</div>`; return; }
    // 由舊到新算累計，顯示時由新到舊
    const asc = [...data].reverse(); let run = 0; const balMap = {};
    asc.forEach((e) => { run += (e.income || 0) - (e.expense || 0); balMap[e.id] = run; });
    rows.innerHTML = data.map((e) => listRow(e, balMap[e.id])).join('');
    rows.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => { location.hash = '#/edit/' + b.dataset.edit; });
    rows.querySelectorAll('[data-del]').forEach((b) => b.onclick = () =>
      confirmDialog(t('list.delConfirm'), async () => { await api.delEntry(b.dataset.del); load(); }));
  }
  let timer;
  root.querySelector('#q').oninput = () => { clearTimeout(timer); timer = setTimeout(load, 250); };
  root.querySelector('#mon').onchange = load;
  load();
}

function listRow(e, bal) {
  const amt = e.income > 0 ? `<div class="amt inc num">${money(e.income, true)}<small>${money(bal)}</small></div>`
    : `<div class="amt exp num">${money(-e.expense, true)}<small>${money(bal)}</small></div>`;
  const actions = canWrite() ? `<div class="swipe-actions">
    <button class="iconbtn" data-edit="${e.id}">${ICON.edit}</button>
    <button class="iconbtn" data-del="${e.id}" style="color:var(--expense)">${ICON.trash}</button></div>` : '';
  return `<div class="entry">
    <div class="ava ${e.income > 0 ? 'inc' : 'exp'}">${esc((e.purpose || '—').slice(0, 1))}</div>
    <div class="mid"><div class="p">${esc(e.purpose) || '—'}</div>
      <div class="m"><span>${e.date}</span>${e.recorder ? `<span>· ${esc(e.recorder)}</span>` : ''}${e.note ? `<span>· ${esc(e.note)}</span>` : ''}</div></div>
    ${e.receipt_path ? `<img class="thumb" src="/${e.receipt_path}" onclick="window.__viewImg('/${e.receipt_path}')">` : ''}
    ${amt}${actions}</div>`;
}

/* ============ REPORT ============ */
export async function report(root) {
  const m = curMonth();
  root.innerHTML = `<div class="view">
    <h1 class="view-title">${t('nav.report')}</h1>
    <div class="card no-print">
      <div class="amount-grid">
        <div class="field"><label>${t('report.from')}</label><input class="input" type="date" id="r-from" value="${m}-01"></div>
        <div class="field"><label>${t('report.to')}</label><input class="input" type="date" id="r-to" value="${todayStr()}"></div>
      </div>
      <button class="btn" id="r-go">${t('report.generate')}</button>
      <div class="btn-row" style="margin-top:10px">
        <a class="btn ghost" id="r-xls" download>${ICON.download}<span>${t('report.export')}</span></a>
        <button class="btn ghost" id="r-print">${ICON.print}<span>${t('report.print')}</span></button>
      </div>
    </div>
    <div class="card" id="r-out"><div class="empty">${t('report.from')} → ${t('report.to')}</div></div>
  </div>`;

  const out = root.querySelector('#r-out');
  const getRange = () => ({ from: root.querySelector('#r-from').value, to: root.querySelector('#r-to').value });
  const updXls = () => { const { from, to } = getRange(); root.querySelector('#r-xls').href = api.exportUrl(from, to, getLang()); };
  updXls();
  root.querySelector('#r-from').onchange = root.querySelector('#r-to').onchange = updXls;
  root.querySelector('#r-print').onclick = () => window.print();

  root.querySelector('#r-go').onclick = async () => {
    const { from, to } = getRange();
    out.innerHTML = '<div class="spin"></div>';
    const data = await api.entries({ from, to });
    if (!data.length) { out.innerHTML = `<div class="empty">${t('list.empty')}</div>`; return; }
    const asc = [...data].reverse(); let run = 0, ti = 0, te = 0;
    const trs = asc.map((e) => {
      run += (e.income || 0) - (e.expense || 0); ti += e.income || 0; te += e.expense || 0;
      return `<tr><td data-label="${t('c.date')}">${e.date}</td><td data-label="${t('c.purpose')}" style="text-align:left">${esc(e.purpose) || '—'}</td>
        <td data-label="${t('c.income')}" class="inc">${e.income ? money(e.income) : ''}</td>
        <td data-label="${t('c.expense')}" class="exp">${e.expense ? money(e.expense) : ''}</td>
        <td data-label="${t('c.balance')}" class="num">${money(run)}</td></tr>`;
    }).join('');
    out.innerHTML = `<h3 style="margin-bottom:6px">${from} → ${to}</h3>
      <div class="stat-row" style="margin:10px 0 16px">
        <div class="stat income"><div class="label">${t('report.totalIncome')}</div><div class="val num">${money(ti)}</div></div>
        <div class="stat expense"><div class="label">${t('report.totalExpense')}</div><div class="val num">${money(te)}</div></div>
      </div>
      <table class="rtable"><thead><tr><th>${t('c.date')}</th><th style="text-align:left">${t('c.purpose')}</th>
        <th>${t('c.income')}</th><th>${t('c.expense')}</th><th>${t('c.balance')}</th></tr></thead>
        <tbody>${trs}<tr class="total"><td data-label="${t('report.net')}" colspan="2">${t('report.net')}</td><td data-label="${t('c.income')}" class="inc">${money(ti)}</td><td data-label="${t('c.expense')}" class="exp">${money(te)}</td><td data-label="${t('c.balance')}" class="num">${money(ti - te)}</td></tr></tbody></table>`;
  };
}

/* ============ SETTINGS ============ */
export async function settings(root) {
  const s = state.settings;
  root.innerHTML = `<div class="view stagger">
    <h1 class="view-title">${t('nav.settings')}</h1>

    <div class="card"><h3><span class="dot"></span>${t('set.language')}</h3>
      <div class="chips" id="langs">
        ${Object.entries(LANGS).map(([k, v]) => `<button class="chip ${getLang() === k ? 'on' : ''}" data-lang="${k}">${v}</button>`).join('')}
      </div></div>

    <div class="card"><h3><span class="dot"></span>${t('set.general')}</h3>
      <div class="field"><label>${t('set.appName')}</label>
        <input class="input" id="s-name" value="${esc(s.app_name || '')}" ${isAdmin() ? '' : 'disabled'}></div>
      <div class="field"><label>${t('set.currency')}</label>
        <input class="input" id="s-cur" value="${esc(s.currency || '')}" ${isAdmin() ? '' : 'disabled'}></div>
      ${isAdmin() ? `<button class="btn sm" id="s-save">${t('c.save')}</button>` : `<div class="muted">${t('set.adminOnly')}</div>`}</div>

    <div class="card"><h3><span class="dot"></span>${t('set.phrases')}</h3><div id="ph"></div></div>

    ${isAdmin() ? `
    <div class="card"><h3><span class="dot"></span>${t('set.users')}</h3><div id="us"></div></div>
    <div class="card"><h3><span class="dot"></span>${t('set.carryover')}</h3><div id="co"></div></div>` : ''}
  </div>`;

  // language
  root.querySelectorAll('[data-lang]').forEach((b) => b.onclick = () => { setLang(b.dataset.lang); location.reload(); });

  // general
  if (isAdmin()) root.querySelector('#s-save').onclick = async () => {
    await api.saveSettings({ app_name: root.querySelector('#s-name').value, currency: root.querySelector('#s-cur').value });
    toast(t('entry.saved')); setTimeout(() => location.reload(), 600);
  };

  renderPhrases(root.querySelector('#ph'));
  if (isAdmin()) { renderUsers(root.querySelector('#us')); renderCarryovers(root.querySelector('#co')); }
}

async function renderPhrases(box) {
  const ps = await api.phrases();
  box.innerHTML = ps.map((p) => `<div class="row"><div class="grow">
      <b>${esc(p.zh)}</b> <span class="muted">· ${esc(p.id_text)} · ${esc(p.en)}</span></div>
      ${canWrite() ? `<button class="iconbtn" data-dp="${p.id}" style="color:var(--expense)">${ICON.trash}</button>` : ''}</div>`).join('')
    + (canWrite() ? `<button class="btn sm ghost" id="addPh" style="margin-top:12px">${ICON.add}<span>${t('set.addPhrase')}</span></button>` : '');
  box.querySelectorAll('[data-dp]').forEach((b) => b.onclick = async () => { await api.delPhrase(b.dataset.dp); renderPhrases(box); });
  const add = box.querySelector('#addPh');
  if (add) add.onclick = () => {
    const { el, close } = modal(`<h3>${t('set.addPhrase')}</h3>
      <div class="field"><label>中文</label><input class="input" id="p-zh"></div>
      <div class="field"><label>Indonesia</label><input class="input" id="p-id"></div>
      <div class="field"><label>English</label><input class="input" id="p-en"></div>
      <button class="btn" id="p-ok">${t('c.save')}</button>`);
    el.querySelector('#p-ok').onclick = async () => {
      await api.addPhrase({ zh: el.querySelector('#p-zh').value, id_text: el.querySelector('#p-id').value, en: el.querySelector('#p-en').value });
      close(); renderPhrases(box);
    };
  };
}

async function renderUsers(box) {
  const us = await api.users();
  const roleName = (r) => t('role.' + r);
  box.innerHTML = us.map((u) => `<div class="row">
      <span class="iconbtn" style="background:var(--surface-2)">${ICON.user}</span>
      <div class="grow"><b>${esc(u.display_name)}</b>
        <div><span class="pill ${u.role}">${roleName(u.role)}</span></div></div>
      <button class="linkbtn" data-edu="${u.id}" data-name="${esc(u.display_name)}" data-role="${u.role}">${ICON.edit}</button>
      ${u.id !== state.user.id ? `<button class="iconbtn" data-du="${u.id}" style="color:var(--expense)">${ICON.trash}</button>` : ''}
    </div>`).join('')
    + `<button class="btn sm ghost" id="addUser" style="margin-top:12px">${ICON.add}<span>${t('set.addUser')}</span></button>`;

  box.querySelectorAll('[data-du]').forEach((b) => b.onclick = () =>
    confirmDialog(t('set.delUserConfirm'), async () => { await api.delUser(b.dataset.du); renderUsers(box); }));
  box.querySelectorAll('[data-edu]').forEach((b) => b.onclick = () => userModal({ id: b.dataset.edu, display_name: b.dataset.name, role: b.dataset.role }, box));
  box.querySelector('#addUser').onclick = () => userModal(null, box);
}

function roleOptions(sel) {
  return ['reader', 'editor', 'admin'].map((r) => `<option value="${r}" ${sel === r ? 'selected' : ''}>${t('role.' + r)}</option>`).join('');
}
function userModal(u, box) {
  const editing = !!u;
  const { el, close } = modal(`<h3>${editing ? t('set.editUser') : t('set.addUser')}</h3>
    <div class="field"><label>${t('set.nickname')}</label><input class="input" id="u-disp" value="${editing ? esc(u.display_name) : ''}"></div>
    <div class="field"><label>${editing ? t('set.newPwd') + ' (' + t('c.optional') + ')' : t('login.password')}</label><input class="input" id="u-pwd" type="text"></div>
    <div class="field"><label>${t('set.role')}</label><select class="input" id="u-role">${roleOptions(editing ? u.role : 'editor')}</select></div>
    <button class="btn" id="u-ok">${t('c.save')}</button>`);
  el.querySelector('#u-ok').onclick = async () => {
    try {
      const role = el.querySelector('#u-role').value;
      const display_name = el.querySelector('#u-disp').value.trim();
      const password = el.querySelector('#u-pwd').value;
      if (!display_name) return toast(t('set.nameRequired'));
      if (editing) await api.updateUser(u.id, { role, display_name, password: password || undefined });
      else {
        if (!password) return toast(t('set.pwdRequired'));
        await api.addUser({ display_name, password, role });
      }
      close(); renderUsers(box);
    } catch (e) { toast(e.message); }
  };
}

async function renderCarryovers(box) {
  const cs = await api.carryovers();
  const year = new Date().getFullYear();
  box.innerHTML = cs.map((c) => `<div class="row"><div class="grow">
      <b>${c.year}</b>
      <div class="muted">${t('set.openIncome')}: ${money(c.opening_income)} ${c.opening_income_date ? '· ' + c.opening_income_date : ''}</div>
      <div class="muted">${t('set.openExpense')}: ${money(c.opening_expense)} ${c.opening_expense_date ? '· ' + c.opening_expense_date : ''}</div></div>
      <button class="linkbtn" data-eco="${c.year}">${ICON.edit}</button>
      <button class="iconbtn" data-dco="${c.year}" style="color:var(--expense)">${ICON.trash}</button></div>`).join('')
    + `<button class="btn sm ghost" id="addCo" style="margin-top:12px">${ICON.add}<span>${t('set.year')} ${year}</span></button>`;
  box.querySelectorAll('[data-dco]').forEach((b) => b.onclick = async () => { await api.delCarryover(b.dataset.dco); renderCarryovers(box); });
  box.querySelectorAll('[data-eco]').forEach((b) => b.onclick = () => coModal(cs.find((x) => String(x.year) === b.dataset.eco), box));
  box.querySelector('#addCo').onclick = () => coModal({ year }, box);
}
function coModal(c, box) {
  const { el, close } = modal(`<h3>${t('set.carryover')}</h3>
    <div class="field"><label>${t('set.year')}</label><input class="input" id="c-year" type="number" value="${c.year}"></div>
    <div class="amount-grid">
      <div class="field"><label>${t('set.openIncome')}</label><input class="input num" id="c-oi" type="number" value="${c.opening_income || ''}"></div>
      <div class="field"><label>${t('set.openIncomeDate')}</label><input class="input" id="c-oid" type="date" value="${c.opening_income_date || ''}"></div>
    </div>
    <div class="amount-grid">
      <div class="field"><label>${t('set.openExpense')}</label><input class="input num" id="c-oe" type="number" value="${c.opening_expense || ''}"></div>
      <div class="field"><label>${t('set.openExpenseDate')}</label><input class="input" id="c-oed" type="date" value="${c.opening_expense_date || ''}"></div>
    </div>
    <button class="btn" id="c-ok">${t('c.save')}</button>`);
  el.querySelector('#c-ok').onclick = async () => {
    const y = el.querySelector('#c-year').value;
    await api.saveCarryover(y, {
      opening_income: el.querySelector('#c-oi').value, opening_income_date: el.querySelector('#c-oid').value,
      opening_expense: el.querySelector('#c-oe').value, opening_expense_date: el.querySelector('#c-oed').value,
    });
    close(); renderCarryovers(box);
  };
}
