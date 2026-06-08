// i18n.js — 中文 / English / Bahasa Indonesia
export const LANGS = { zh: '中文', en: 'English', id: 'Indonesia' };

const DICT = {
  zh: {
    'app.title': '家庭記帳本',
    'nav.dashboard': '總覽', 'nav.add': '記帳', 'nav.list': '明細', 'nav.report': '報表', 'nav.settings': '設定',
    'c.income': '收入', 'c.expense': '支出', 'c.balance': '結餘', 'c.date': '日期', 'c.purpose': '用途',
    'c.note': '備註', 'c.recorder': '記帳者', 'c.save': '儲存', 'c.cancel': '取消', 'c.delete': '刪除',
    'c.edit': '編輯', 'c.add': '新增', 'c.search': '搜尋', 'c.logout': '登出', 'c.today': '今天',
    'c.all': '全部', 'c.total': '合計', 'c.actions': '操作', 'c.optional': '選填', 'c.none': '無',
    'c.loading': '載入中…', 'c.confirm': '確定', 'c.required': '必填',
    'login.subtitle': '記錄每一筆家庭收支', 'login.username': '帳號', 'login.password': '密碼',
    'login.submit': '登入', 'login.error': '帳號或密碼錯誤',
    'dash.month': '本月', 'dash.net': '本月結餘', 'dash.cum': '累計結餘', 'dash.byPurpose': '支出分類',
    'dash.trend': '收支趨勢', 'dash.noData': '尚無資料', 'dash.entries': '筆',
    'entry.choosePhrase': '常用用途', 'entry.purposePlaceholder': '輸入或選擇用途',
    'entry.incomeAmount': '收入金額', 'entry.expenseAmount': '支出金額', 'entry.balancePreview': '本筆結餘',
    'entry.receipt': '收據／發票', 'entry.attach': '拍照或上傳', 'entry.saved': '已儲存',
    'list.empty': '沒有符合的紀錄', 'list.receipt': '收據', 'list.delConfirm': '確定刪除這筆紀錄？',
    'report.from': '起始日', 'report.to': '結束日', 'report.generate': '產生報表', 'report.export': '匯出 XLS',
    'report.print': '列印', 'report.totalIncome': '總收入', 'report.totalExpense': '總支出', 'report.net': '淨額',
    'set.general': '一般', 'set.appName': '帳本名稱', 'set.currency': '貨幣符號', 'set.language': '語言',
    'set.users': '使用者', 'set.addUser': '新增使用者', 'set.role': '權限', 'set.displayName': '顯示名稱',
    'set.resetPwd': '重設密碼', 'set.newPwd': '新密碼', 'set.delUserConfirm': '確定刪除此使用者？',
    'set.carryover': '年度期初轉入', 'set.year': '年度', 'set.openIncome': '期初收入', 'set.openExpense': '期初支出',
    'set.openIncomeDate': '收入日期', 'set.openExpenseDate': '支出日期',
    'set.phrases': '常用片語', 'set.addPhrase': '新增片語', 'set.adminOnly': '僅管理員可操作',
    'role.admin': '管理員', 'role.editor': '記帳者', 'role.reader': '閱讀者',
  },
  en: {
    'app.title': 'Family Ledger',
    'nav.dashboard': 'Overview', 'nav.add': 'Add', 'nav.list': 'Records', 'nav.report': 'Report', 'nav.settings': 'Settings',
    'c.income': 'Income', 'c.expense': 'Expense', 'c.balance': 'Balance', 'c.date': 'Date', 'c.purpose': 'Purpose',
    'c.note': 'Note', 'c.recorder': 'Recorder', 'c.save': 'Save', 'c.cancel': 'Cancel', 'c.delete': 'Delete',
    'c.edit': 'Edit', 'c.add': 'Add', 'c.search': 'Search', 'c.logout': 'Log out', 'c.today': 'Today',
    'c.all': 'All', 'c.total': 'Total', 'c.actions': 'Actions', 'c.optional': 'optional', 'c.none': 'None',
    'c.loading': 'Loading…', 'c.confirm': 'OK', 'c.required': 'required',
    'login.subtitle': 'Track every family income & expense', 'login.username': 'Username', 'login.password': 'Password',
    'login.submit': 'Sign in', 'login.error': 'Wrong username or password',
    'dash.month': 'This month', 'dash.net': 'Monthly balance', 'dash.cum': 'Cumulative balance', 'dash.byPurpose': 'Expense by category',
    'dash.trend': 'Income / Expense trend', 'dash.noData': 'No data yet', 'dash.entries': 'records',
    'entry.choosePhrase': 'Quick phrases', 'entry.purposePlaceholder': 'Type or pick a purpose',
    'entry.incomeAmount': 'Income amount', 'entry.expenseAmount': 'Expense amount', 'entry.balancePreview': 'Balance',
    'entry.receipt': 'Receipt / Invoice', 'entry.attach': 'Take photo or upload', 'entry.saved': 'Saved',
    'list.empty': 'No matching records', 'list.receipt': 'Receipt', 'list.delConfirm': 'Delete this record?',
    'report.from': 'From', 'report.to': 'To', 'report.generate': 'Generate', 'report.export': 'Export XLS',
    'report.print': 'Print', 'report.totalIncome': 'Total income', 'report.totalExpense': 'Total expense', 'report.net': 'Net',
    'set.general': 'General', 'set.appName': 'Ledger name', 'set.currency': 'Currency symbol', 'set.language': 'Language',
    'set.users': 'Users', 'set.addUser': 'Add user', 'set.role': 'Role', 'set.displayName': 'Display name',
    'set.resetPwd': 'Reset password', 'set.newPwd': 'New password', 'set.delUserConfirm': 'Delete this user?',
    'set.carryover': 'Year opening carryover', 'set.year': 'Year', 'set.openIncome': 'Opening income', 'set.openExpense': 'Opening expense',
    'set.openIncomeDate': 'Income date', 'set.openExpenseDate': 'Expense date',
    'set.phrases': 'Quick phrases', 'set.addPhrase': 'Add phrase', 'set.adminOnly': 'Admin only',
    'role.admin': 'Admin', 'role.editor': 'Editor', 'role.reader': 'Reader',
  },
  id: {
    'app.title': 'Buku Kas Keluarga',
    'nav.dashboard': 'Ringkasan', 'nav.add': 'Catat', 'nav.list': 'Catatan', 'nav.report': 'Laporan', 'nav.settings': 'Pengaturan',
    'c.income': 'Pemasukan', 'c.expense': 'Pengeluaran', 'c.balance': 'Saldo', 'c.date': 'Tanggal', 'c.purpose': 'Keperluan',
    'c.note': 'Catatan', 'c.recorder': 'Pencatat', 'c.save': 'Simpan', 'c.cancel': 'Batal', 'c.delete': 'Hapus',
    'c.edit': 'Ubah', 'c.add': 'Tambah', 'c.search': 'Cari', 'c.logout': 'Keluar', 'c.today': 'Hari ini',
    'c.all': 'Semua', 'c.total': 'Jumlah', 'c.actions': 'Aksi', 'c.optional': 'opsional', 'c.none': 'Tidak ada',
    'c.loading': 'Memuat…', 'c.confirm': 'OK', 'c.required': 'wajib',
    'login.subtitle': 'Catat setiap pemasukan & pengeluaran keluarga', 'login.username': 'Nama pengguna', 'login.password': 'Kata sandi',
    'login.submit': 'Masuk', 'login.error': 'Nama pengguna atau kata sandi salah',
    'dash.month': 'Bulan ini', 'dash.net': 'Saldo bulan ini', 'dash.cum': 'Saldo kumulatif', 'dash.byPurpose': 'Pengeluaran per kategori',
    'dash.trend': 'Tren pemasukan / pengeluaran', 'dash.noData': 'Belum ada data', 'dash.entries': 'catatan',
    'entry.choosePhrase': 'Frasa cepat', 'entry.purposePlaceholder': 'Ketik atau pilih keperluan',
    'entry.incomeAmount': 'Jumlah pemasukan', 'entry.expenseAmount': 'Jumlah pengeluaran', 'entry.balancePreview': 'Saldo',
    'entry.receipt': 'Struk / Faktur', 'entry.attach': 'Foto atau unggah', 'entry.saved': 'Tersimpan',
    'list.empty': 'Tidak ada catatan', 'list.receipt': 'Struk', 'list.delConfirm': 'Hapus catatan ini?',
    'report.from': 'Dari', 'report.to': 'Sampai', 'report.generate': 'Buat laporan', 'report.export': 'Ekspor XLS',
    'report.print': 'Cetak', 'report.totalIncome': 'Total pemasukan', 'report.totalExpense': 'Total pengeluaran', 'report.net': 'Bersih',
    'set.general': 'Umum', 'set.appName': 'Nama buku kas', 'set.currency': 'Simbol mata uang', 'set.language': 'Bahasa',
    'set.users': 'Pengguna', 'set.addUser': 'Tambah pengguna', 'set.role': 'Peran', 'set.displayName': 'Nama tampilan',
    'set.resetPwd': 'Atur ulang sandi', 'set.newPwd': 'Sandi baru', 'set.delUserConfirm': 'Hapus pengguna ini?',
    'set.carryover': 'Saldo awal tahunan', 'set.year': 'Tahun', 'set.openIncome': 'Pemasukan awal', 'set.openExpense': 'Pengeluaran awal',
    'set.openIncomeDate': 'Tanggal pemasukan', 'set.openExpenseDate': 'Tanggal pengeluaran',
    'set.phrases': 'Frasa cepat', 'set.addPhrase': 'Tambah frasa', 'set.adminOnly': 'Khusus admin',
    'role.admin': 'Admin', 'role.editor': 'Pencatat', 'role.reader': 'Pembaca',
  },
};

let current = localStorage.getItem('lang') || 'zh';
export function getLang() { return current; }
export function setLang(l) { current = l; localStorage.setItem('lang', l); }
export function t(key) { return (DICT[current] && DICT[current][key]) || (DICT.zh[key]) || key; }
// 依語言取片語顯示文字
export function phraseLabel(p) {
  if (current === 'id') return p.id_text || p.zh || p.en;
  if (current === 'en') return p.en || p.zh || p.id_text;
  return p.zh || p.id_text || p.en;
}
