# Funbox LINE 抽選門市導覽

非官方靜態網頁：整理台灣 Funbox 戰鬥陀螺 LINE 抽選門市，依 **北／桃竹苗／中部／南部／東部** 分類，可用定位找出最近的店，並一鍵加入 LINE、開粉專或 Google 地圖。

本站只收錄「抽選表單上有店、且已有 LINE 加好友網址」的 35 家。活動內容以各店粉專與 LINE 公告為準。

## 本機預覽

需要已安裝 [Node.js](https://nodejs.org/)。

```bash
npm install
npm run dev
```

瀏覽器開啟終端機顯示的本機網址（通常是 `http://localhost:5173`）。

建置正式檔：

```bash
npm run build
npm run preview
```

產物在 `dist/`。

## 更新門市

編輯 [`src/stores.js`](src/stores.js)：

- `name`：店名
- `region`：`north` | `tyhcm` | `central` | `south` | `east`
- `facebook` / `line`：粉專與加好友網址
- `lat` / `lng`：購物中心約略座標（給「最近門市」排序用）

## 部署到 GitHub Pages

1. 在 GitHub 建立新 repo，把這個資料夾推上去。
2. 本專案 `vite.config.js` 已設 `base: "./"`，可當 Project Page 或根網域使用。
3. 本 repo 已附 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。推到 `main` 後會自動建置。
4. 到 GitHub **Settings → Pages**，Source 選 **GitHub Actions**。
5. 第一次部署完成後，公開網址會類似：`https://<你的帳號>.github.io/funbox-lottery/`

## 注意

- 定位需要瀏覽器授權；拒絕時仍可用區域篩選與搜尋。
- 座標是商場公開位置的約略值，用來比遠近，不是店內精確點位。
