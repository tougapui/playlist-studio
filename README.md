# Playlist Studio

Elaine 的 11 個 Spotify 公開歌單策展入口。純靜態網頁,無框架、無建置工具,部署於 GitHub Pages。

## 本地預覽

因為 `app.js` 使用 `fetch()` 讀取 `data/playlists.json`,直接用瀏覽器開啟 `index.html` 檔案會因為瀏覽器的 CORS 限制而讀不到資料,**必須**透過本地伺服器開啟:

```bash
python3 -m http.server 8000
```

然後在瀏覽器打開 `http://localhost:8000`。

## 如何新增一個歌單

1. 打開 `data/playlists.json`,在 `playlists` 陣列最後加入一個物件,例如:

   ```json
   {
     "slug": "my-new-playlist",
     "name": "My New Playlist",
     "spotifyId": "xxxxxxxxxxxxxxxxxxxxxx",
     "family": "japanese",
     "description": "一句話的歌單說明。",
     "followers": null,
     "featured": false
   }
   ```

   欄位說明:
   - `slug`:英文小寫、連字號分隔,用來對應封面檔名。
   - `family`:五個家族其中之一,`japanese` / `solo` / `function` / `screen` / `kpop`。
   - `followers`:目前粉絲數,不知道或不想顯示就填 `null`。
   - `featured`:是否為首頁主打歌單,全站只能有一個是 `true`。

2. 準備一張正方形封面圖,存成 `covers/{slug}.jpg`(例如 `covers/my-new-playlist.jpg`)。

3. 把改動 push 到 GitHub 即完成,網站會自動更新。

## 如何更換「本期主打」

在 `data/playlists.json` 裡:
1. 把目前 `featured: true` 的那個歌單改成 `featured: false`。
2. 把新想主打的歌單改成 `featured: true`。

全站僅允許同時有一個 `featured: true`。

## 如何取得歌單的 spotifyId

打開 Spotify 分享連結,格式是:

```
https://open.spotify.com/playlist/6YzRnN5s7ksacBU4e7LGsI?si=xxxxxxxx
```

`playlist/` 之後、`?` 之前的那一串英數字(例如 `6YzRnN5s7ksacBU4e7LGsI`)就是 `spotifyId`。

## 關於完整播放 / 30 秒試聽

- 在桌機瀏覽器**已登入 Spotify** 的狀態下點開歌單,內嵌播放器會完整播放。
- 訪客或未登入 Spotify 的瀏覽器,內嵌播放器只能播放 30 秒試聽,這是 Spotify 平台本身的規則,不是網站的問題。
- 手機上點擊歌單會直接開啟 Spotify App(或跳轉 open.spotify.com),同樣是完整播放。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個 public repository(建議命名 `playlist-studio`)。
2. 把這個資料夾的內容 push 上去。
3. 到 repo 的 Settings → Pages → Source,選擇 `main` branch、`/ (root)`,按 Save。
4. 網站網址會是 `https://{你的 GitHub 帳號}.github.io/playlist-studio/`。
