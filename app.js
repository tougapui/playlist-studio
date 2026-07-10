(function () {
  "use strict";

  var DATA_URL = "data/playlists.json";

  var state = {
    data: null
  };

  function coverSrc(playlist) {
    return playlist.coverUrl || "covers/" + playlist.slug + ".jpg";
  }

  function initials(name) {
    var words = name.trim().split(/\s+/);
    var chars = words.map(function (w) { return w[0]; }).join("");
    return chars.slice(0, 3).toUpperCase();
  }

  function makeCoverImg(playlist, className) {
    var img = document.createElement("img");
    img.className = className;
    img.src = coverSrc(playlist);
    img.alt = playlist.name;
    img.loading = "lazy";
    img.onerror = function () {
      var fallback = document.createElement("div");
      fallback.className = className + " cover-fallback";
      fallback.textContent = initials(playlist.name);
      img.replaceWith(fallback);
    };
    return img;
  }

  function embedUrl(playlist) {
    return "https://open.spotify.com/embed/playlist/" + playlist.spotifyId + "?theme=0&autoplay=1";
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ---- sidebar player ---- */

  function openPlayer(playlist) {
    var sidebar = document.getElementById("player-sidebar");
    var name = document.getElementById("player-name");
    var embed = document.getElementById("player-embed");

    name.textContent = playlist.name;

    embed.innerHTML = "";
    var iframe = document.createElement("iframe");
    iframe.src = embedUrl(playlist);
    iframe.frameBorder = "0";
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    embed.appendChild(iframe);

    sidebar.classList.add("is-open");
    document.body.classList.add("has-player");
  }

  function closePlayer() {
    var sidebar = document.getElementById("player-sidebar");
    var embed = document.getElementById("player-embed");
    sidebar.classList.remove("is-open");
    document.body.classList.remove("has-player");
    embed.innerHTML = "";
  }

  /* ---- wall ---- */

  function renderWall() {
    var container = document.getElementById("wall-families");
    container.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "wall-grid";

    shuffle(state.data.playlists).forEach(function (playlist) {
      grid.appendChild(makeWallCard(playlist));
    });

    container.appendChild(grid);
  }

  function makeWallCard(playlist) {
    var card = document.createElement("div");
    card.className = "wall-card";

    var coverWrap = document.createElement("div");
    coverWrap.className = "wall-card__cover-wrap";

    var cover = makeCoverImg(playlist, "wall-card__cover");
    coverWrap.appendChild(cover);

    var playOverlay = document.createElement("div");
    playOverlay.className = "wall-card__play";
    var playIcon = document.createElement("div");
    playIcon.className = "wall-card__play-icon";
    playIcon.textContent = "▶";
    playOverlay.appendChild(playIcon);
    coverWrap.appendChild(playOverlay);

    card.appendChild(coverWrap);

    var name = document.createElement("div");
    name.className = "wall-card__name";
    name.textContent = playlist.name;
    card.appendChild(name);

    coverWrap.addEventListener("click", function () {
      openPlayer(playlist);
    });

    return card;
  }

  /* ---- init ---- */

  function init(data) {
    state.data = data;

    document.getElementById("footer-year").textContent = new Date().getFullYear();

    renderWall();

    document.getElementById("player-close").addEventListener("click", closePlayer);
  }

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (res) { return res.json(); })
    .then(init)
    .catch(function (err) {
      console.error("Failed to load playlist data:", err);
      document.getElementById("main").textContent = "資料載入失敗,請確認以本地伺服器開啟(見 README)。";
    });
})();
