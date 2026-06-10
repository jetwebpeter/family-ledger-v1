# Render 部署說明

## 推薦工具

建議使用 `Render.com` 部署此專案，因為它支援 Node.js Web Service 與持久化磁碟。此專案需要本地 SQLite 資料庫與上傳檔案存放，因此不適合直接部署到 Vercel 或其他無法持久化檔案系統的 serverless 平台。

## 已新增設定

- `render.yaml`：Render 的 Git-based 部署設定
- `DATA_DIR` 會設為 `/data`
- 需要在 Render 介面建立 secret `JWT_SECRET`

## 部署步驟

1. 將專案推到 GitHub（你已經有 remote）。
2. 登入 Render，選擇 `New -> Web Service`。
3. 連結到你的 GitHub repository `jetwebpeter/family-ledger-v2`。
4. 選擇分支 `main`。
5. Render 會自動讀取 `render.yaml`。
6. 在 Render 的 Environment 頁面建立 secret：
   - `JWT_SECRET` = 長且安全的隨機字串
7. 確認 env 變數：
   - `NODE_ENV=production`
   - `DATA_DIR=/data`
8. 啟用 Auto Deploy 或手動部署。

## 重要說明

- `data/` 目錄已加入 `.gitignore`，不會被推到 Git。
- Render 的持久化磁碟會掛載到容器內的 `/data`，此專案會把 SQLite DB 與 `uploads/` 存到那裏。
- 若要啟用 HTTPS，Render 會自動管理 SSL 憑證。

## 之後驗證

部署完成後，開啟 Render 提供的網址，應可看到前端頁面與 API 正常運作。
