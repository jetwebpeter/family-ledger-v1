# 家庭記帳本 Family Ledger

多人家庭記帳 Web App，含 Dashboard 圖表分析、收支記帳、收據拍照附件、XLS 匯出、權限管理與多語系（中／英／印尼）。手機 RWD，可發佈於公網。

## 技術
Node.js（內建 `node:sqlite`）＋ Express ＋ 原生 ES Module 前端（免建置）。資料存於 SQLite。

> 需 **Node ≥ 22.5**（使用內建 SQLite，無原生編譯）。

## 安裝與啟動
```bash
npm install
npm start          # 預設 http://localhost:3000
```

預設管理員：帳號 `admin`　密碼 `0912541540`（請登入後盡速於設定中新增使用者並更換）。

## 環境變數（選填，見 `.env.example`）
| 變數 | 說明 | 預設 |
|------|------|------|
| `PORT` | 連接埠 | 3000 |
| `JWT_SECRET` | 登入簽章金鑰，正式環境務必更換 | 內建（不安全） |
| `DATA_DIR` | DB 與附件存放目錄 | `./data` |
| `NODE_ENV` | `production` 時啟用 secure cookie | — |

## 權限
- **admin**：全部功能，可新增使用者、設定密碼、年度期初轉入、系統參數。
- **editor（記帳者）**：記帳、編輯、匯出。
- **reader（閱讀者）**：僅查詢與報表。

## 功能
- **Dashboard**：依月份統計收入／支出／結餘，用途消費圓餅圖與多月趨勢圖。
- **記帳**：日期（預設今天）、用途（片語或手動）、收入／支出（數字鍵盤）、即時結餘、收據拍照上傳、自動記錄記帳者。
- **明細**：搜尋、月份篩選、逐列累計結餘。
- **報表**：自訂日期區間表格、列印（不含附件）、匯出 XLS。
- **設定**：使用者管理、年度期末轉期初（收入／支出金額與日期）、常用片語（中／印尼／英）、語系切換。

## 公網部署
1. 設定環境變數（至少 `JWT_SECRET`、`NODE_ENV=production`）。
2. 於支援 Node ≥22.5 的平台執行 `npm start`，或置於反向代理（Nginx／Caddy）後並啟用 HTTPS。
3. 持久化 `DATA_DIR`（含資料庫與上傳附件）。
# claude-b2b2c-tour
# family-ledger-v1
