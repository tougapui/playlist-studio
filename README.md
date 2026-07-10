# Playlist Studio

一個用來展示、播放自己 Spotify 公開歌單的個人網站。純靜態 HTML/CSS/JS,無框架、無建置工具,免費部署在 GitHub Pages 上。點擊任一封面,右側(手機上是底部)會彈出 Spotify 官方內嵌播放器直接播放。

這份 repo 本身就是範本,任何人都可以複製一份、換成自己的歌單資料,幾分鐘內就能有一個自己的版本。

## 快速開始(複製一份給自己用)

1. 在這個 repo 頁面右上角,如果看到 **Use this template** 按鈕,點下去建立一份屬於你自己的新 repo(沒有這顆按鈕的話用一般的 **Fork** 也可以)。
2. 打開你複製出來的 repo,依照下面「客製化」的步驟改成自己的資料。
3. 到 repo 的 **Settings → Pages → Source**,選擇 `main` branch、`/ (root)`,按 Save。
4. 等 1–2 分鐘,網站網址會是 `https://{你的 GitHub 帳號}.github.io/{repo 名稱}/`。

不需要懂程式,只要會編輯文字檔跟上傳圖片就能完成。

## 客製化:換成你自己的品牌

打開 `data/playlists.json`,最上面的 `site` 區塊控制網站標題與作者名稱,不用碰任何 HTML/CSS/JS:

```json
"site": {
  "title": "Playlist Studio",
  "owner": "你的名字或代號"
}
```

- `title`:瀏覽器分頁標題,也是首頁大標題。
- `owner`:顯示在標題上方的小字署名。

## 新增一個歌單(SOP)

1. **取得 spotifyId**:打開 Spotify App,分享該歌單 → 複製連結,會得到類似這樣的網址:

   ```
   https://open.spotify.com/playlist/6YzRnN5s7ksacBU4e7LGsI?si=xxxxxxxx
   ```

   `playlist/` 之後、`?` 之前的那串英數字(例如 `6YzRnN5s7ksacBU4e7LGsI`)就是 `spotifyId`。

2. **準備封面圖**:一張正方形圖片,存成 `covers/{slug}.jpg`。`slug` 是你自己取的英文小寫代號(連字號分隔),例如 `my-new-playlist`。

3. **編輯 `data/playlists.json`**,在 `playlists` 陣列最後加入一個物件:

   ```json
   {
     "slug": "my-new-playlist",
     "name": "My New Playlist",
     "spotifyId": "xxxxxxxxxxxxxxxxxxxxxx",
     "family": "japanese",
     "description": "一句話的歌單說明。",
     "followers": null
   }
   ```

   欄位說明:
   - `slug`:對應封面檔名,見步驟 2。
   - `name`:顯示在網站上的歌單名稱。
   - `spotifyId`:見步驟 1。
   - `family`:自由分類用的標籤,目前網頁上不會顯示,純粹方便你自己管理資料(可以填任何字串,或乾脆固定填一樣的值)。
   - `description`:一句話說明,顯示在封面下方(目前封面牆模式只顯示歌單名稱,這欄位保留給之後擴充用)。
   - `followers`:粉絲數,不知道或不想顯示就填 `null`。
   - `coverUrl`(選填):若填入一個圖片網址,會優先顯示這張圖,不填則使用 `covers/{slug}.jpg`。

4. **把改動 commit + push 到 GitHub**,網站會在 1 分鐘內自動更新,不需要重新部署。

## 播放方式與登入限制

- 點擊任一封面,畫面右側(手機上是底部)會彈出 Spotify 官方內嵌播放器,直接在頁面裡播放,網站本身不會跳轉到 open.spotify.com。
- 瀏覽器**已登入 Spotify** 的狀態下播放,會是完整歌曲;訪客或未登入的瀏覽器,只有 30 秒試聽,這是 Spotify 平台本身的規則,不是網站的問題。
- 若已登入仍只有 30 秒試聽,通常是瀏覽器封鎖了第三方 Cookie,需要把 `open.spotify.com` 加入例外。
- 在 iPad / iPhone 上(所有瀏覽器底層都是 WebKit),即使關閉「防止跨網站追蹤」,Apple 較新的隱私機制仍常常讓內嵌播放器讀不到登入狀態,目前沒有完全解法,這是 Spotify 嵌入元件本身的已知限制。

## 本地預覽

因為 `app.js` 使用 `fetch()` 讀取 `data/playlists.json`,直接用瀏覽器開啟 `index.html` 檔案會因為瀏覽器的 CORS 限制而讀不到資料,**必須**透過本地伺服器開啟:

```bash
python3 -m http.server 8000
```

然後在瀏覽器打開 `http://localhost:8000`。

## 檔案結構

```
index.html          # 頁面骨架
style.css            # 全部樣式
app.js                # 讀取資料、渲染封面牆、播放器邏輯
data/playlists.json  # 網站標題 + 全部歌單資料(客製化主要改這裡)
covers/               # 封面圖(檔名對應 slug)
```
