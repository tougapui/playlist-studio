(function () {
  "use strict";

  var DATA_URL = "data/playlists.json";
  var VIEW_MODE_KEY = "psViewMode";

  var state = {
    data: null,
    viewMode: "index"
  };

  var SPOTIFY_ICON_SVG = '<svg class="spotify-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9.3" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '<path d="M6.8 9.6c3.6-1.4 6.8-1.4 10.4 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M7.3 12.4c2.9-1.1 6.5-1.1 9.4 0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M7.9 15.1c2.2-.8 5.1-.8 7.3 0" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
    '</svg>';

  function isMobile() {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function familyById(id) {
    return state.data.families.find(function (f) { return f.id === id; });
  }

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

  function openLink(playlist) {
    return "https://open.spotify.com/playlist/" + playlist.spotifyId;
  }

  function embedUrl(playlist) {
    return "https://open.spotify.com/embed/playlist/" + playlist.spotifyId + "?theme=0&autoplay=1";
  }

  function makeEmbedWrap(playlist) {
    var wrap = document.createElement("div");
    wrap.className = "embed-wrap";
    var iframe = document.createElement("iframe");
    iframe.src = embedUrl(playlist);
    iframe.width = "100%";
    iframe.height = "152";
    iframe.frameBorder = "0";
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    iframe.loading = "lazy";
    wrap.appendChild(iframe);
    return wrap;
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

  function makeOpenLink(playlist) {
    var a = document.createElement("a");
    a.className = "open-link";
    a.href = openLink(playlist);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = SPOTIFY_ICON_SVG + " 在 spotify 開啟 ↗";
    return a;
  }

  /* ---- index mode ---- */

  function renderFeatured() {
    var container = document.getElementById("index-featured");
    container.innerHTML = "";
    var featured = state.data.playlists.find(function (p) { return p.featured; });
    if (!featured) return;

    var card = document.createElement("div");
    card.className = "featured-card";

    var coverWrap = document.createElement("div");
    coverWrap.className = "featured-card__cover-wrap";

    var cover = makeCoverImg(featured, "featured-card__cover");
    coverWrap.appendChild(cover);

    var playOverlay = document.createElement("div");
    playOverlay.className = "featured-card__play";
    var playIcon = document.createElement("div");
    playIcon.className = "featured-card__play-icon";
    playIcon.textContent = "▶";
    playOverlay.appendChild(playIcon);
    coverWrap.appendChild(playOverlay);

    card.appendChild(coverWrap);

    var panel = document.createElement("div");
    panel.className = "featured-card__panel";
    card.appendChild(panel);

    coverWrap.addEventListener("click", function () {
      handleFeaturedCoverClick(featured, panel, coverWrap);
    });

    var label = document.createElement("div");
    label.className = "featured-card__label";
    label.textContent = "本期主打";
    card.appendChild(label);

    var name = document.createElement("div");
    name.className = "featured-card__name";
    name.textContent = featured.name;
    card.appendChild(name);

    var desc = document.createElement("div");
    desc.className = "featured-card__desc";
    desc.textContent = featured.description;
    card.appendChild(desc);

    if (featured.followers !== null && featured.followers !== undefined) {
      var followers = document.createElement("div");
      followers.className = "featured-card__followers";
      followers.textContent = featured.followers + " 名粉絲";
      card.appendChild(followers);
    }

    var play = document.createElement("a");
    play.className = "play-pill";
    play.href = openLink(featured);
    play.target = "_blank";
    play.rel = "noopener noreferrer";
    play.innerHTML = SPOTIFY_ICON_SVG + " 播放 ▶";
    card.appendChild(play);

    container.appendChild(card);
  }

  function handleFeaturedCoverClick(playlist, panel, coverWrap) {
    if (isMobile()) {
      window.open(openLink(playlist), "_blank", "noopener,noreferrer");
      return;
    }
    var isOpen = panel.classList.contains("is-open");
    closeAllPanels(panel);
    if (isOpen) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      coverWrap.hidden = false;
    } else {
      var inner = document.createElement("div");
      inner.className = "featured-card__panel-inner";
      inner.appendChild(makeEmbedWrap(playlist));
      var actions = document.createElement("div");
      actions.className = "embed-actions";
      actions.appendChild(makeOpenLink(playlist));
      inner.appendChild(actions);
      panel.innerHTML = "";
      panel.appendChild(inner);
      panel.classList.add("is-open");
      panel._hideTarget = coverWrap;
      coverWrap.hidden = true;
    }
  }

  function orderedPlaylists() {
    var ordered = [];
    state.data.families.forEach(function (fam) {
      state.data.playlists.forEach(function (p) {
        if (p.family === fam.id) ordered.push(p);
      });
    });
    return ordered;
  }

  function renderIndexList() {
    var container = document.getElementById("index-list");
    container.innerHTML = "";
    var list = orderedPlaylists();

    list.forEach(function (playlist, i) {
      var row = document.createElement("div");
      row.className = "index-row";

      var head = document.createElement("button");
      head.type = "button";
      head.className = "index-row__head";

      var thumbWrap = document.createElement("span");
      thumbWrap.className = "index-row__thumb-wrap";
      var thumb = makeCoverImg(playlist, "index-row__thumb");
      thumbWrap.appendChild(thumb);
      var thumbPlay = document.createElement("span");
      thumbPlay.className = "index-row__thumb-play";
      var thumbPlayIcon = document.createElement("span");
      thumbPlayIcon.className = "index-row__thumb-play-icon";
      thumbPlayIcon.textContent = "▶";
      thumbPlay.appendChild(thumbPlayIcon);
      thumbWrap.appendChild(thumbPlay);
      head.appendChild(thumbWrap);

      var num = document.createElement("span");
      num.className = "index-row__num";
      num.textContent = String(i + 1).padStart(2, "0");
      head.appendChild(num);

      var name = document.createElement("span");
      name.className = "index-row__name";
      name.textContent = playlist.name;
      head.appendChild(name);

      var fam = familyById(playlist.family);
      var tag = document.createElement("span");
      tag.className = "index-row__tag";
      tag.dataset.family = playlist.family;
      tag.textContent = fam.label;
      head.appendChild(tag);

      row.appendChild(head);

      var panel = document.createElement("div");
      panel.className = "index-row__panel";
      row.appendChild(panel);

      head.addEventListener("click", function () {
        handleRowClick(playlist, panel, thumbWrap);
      });

      container.appendChild(row);
    });
  }

  function buildPanelContent(playlist, panel) {
    var inner = document.createElement("div");
    inner.className = "index-row__panel-inner";

    var body = document.createElement("div");
    body.className = "index-row__panel-body";

    var desc = document.createElement("div");
    desc.className = "index-row__desc";
    desc.textContent = playlist.description;
    body.appendChild(desc);

    body.appendChild(makeEmbedWrap(playlist));

    var actions = document.createElement("div");
    actions.className = "embed-actions";
    actions.appendChild(makeOpenLink(playlist));
    body.appendChild(actions);

    inner.appendChild(body);
    panel.appendChild(inner);
  }

  function closeAllPanels(except) {
    document.querySelectorAll(
      ".index-row__panel.is-open, .featured-card__panel.is-open"
    ).forEach(function (p) {
      if (p !== except) {
        p.classList.remove("is-open");
        p.innerHTML = "";
        if (p._hideTarget) {
          p._hideTarget.hidden = false;
          p._hideTarget = null;
        }
      }
    });
  }

  function handleRowClick(playlist, panel, thumbWrap) {
    if (isMobile()) {
      window.open(openLink(playlist), "_blank", "noopener,noreferrer");
      return;
    }
    var isOpen = panel.classList.contains("is-open");
    closeAllPanels(panel);
    if (isOpen) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      thumbWrap.hidden = false;
    } else {
      panel.innerHTML = "";
      buildPanelContent(playlist, panel);
      panel.classList.add("is-open");
      panel._hideTarget = thumbWrap;
      thumbWrap.hidden = true;
    }
  }

  /* ---- wall mode ---- */

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

  var activeWallCover = null;

  function fillWallCoverIdle(coverWrap, playlist) {
    coverWrap.innerHTML = "";
    coverWrap.dataset.playing = "0";

    var cover = makeCoverImg(playlist, "wall-card__cover");
    coverWrap.appendChild(cover);

    var playOverlay = document.createElement("div");
    playOverlay.className = "wall-card__play";
    var playIcon = document.createElement("div");
    playIcon.className = "wall-card__play-icon";
    playIcon.textContent = "▶";
    playOverlay.appendChild(playIcon);
    coverWrap.appendChild(playOverlay);
  }

  function makeWallCard(playlist) {
    var card = document.createElement("div");
    card.className = "wall-card";

    var coverWrap = document.createElement("div");
    coverWrap.className = "wall-card__cover-wrap";
    fillWallCoverIdle(coverWrap, playlist);
    card.appendChild(coverWrap);

    var name = document.createElement("div");
    name.className = "wall-card__name";
    name.textContent = playlist.name;
    card.appendChild(name);

    coverWrap.addEventListener("click", function () {
      if (isMobile()) {
        window.open(openLink(playlist), "_blank", "noopener,noreferrer");
        return;
      }
      if (coverWrap.dataset.playing === "1") return;
      if (activeWallCover && activeWallCover !== coverWrap) {
        fillWallCoverIdle(activeWallCover, activeWallCover._playlist);
      }
      coverWrap.innerHTML = "";
      var iframe = document.createElement("iframe");
      iframe.className = "wall-card__embed";
      iframe.src = embedUrl(playlist);
      iframe.frameBorder = "0";
      iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
      iframe.loading = "lazy";
      coverWrap.appendChild(iframe);
      coverWrap.dataset.playing = "1";
      coverWrap._playlist = playlist;
      activeWallCover = coverWrap;
    });

    return card;
  }

  /* ---- view mode switching ---- */

  function setViewMode(mode) {
    state.viewMode = mode;
    localStorage.setItem(VIEW_MODE_KEY, mode);

    document.getElementById("view-index").hidden = mode !== "index";
    document.getElementById("view-wall").hidden = mode !== "wall";

    document.querySelectorAll(".view-toggle__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.view === mode);
    });
  }

  function initViewToggle() {
    document.querySelectorAll(".view-toggle__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setViewMode(btn.dataset.view);
      });
    });
  }

  /* ---- init ---- */

  function init(data) {
    state.data = data;

    document.getElementById("footer-year").textContent = new Date().getFullYear();

    renderFeatured();
    renderIndexList();
    renderWall();
    initViewToggle();

    var savedMode = localStorage.getItem(VIEW_MODE_KEY);
    setViewMode(savedMode === "wall" ? "wall" : "index");
  }

  fetch(DATA_URL)
    .then(function (res) { return res.json(); })
    .then(init)
    .catch(function (err) {
      console.error("Failed to load playlist data:", err);
      document.getElementById("main").textContent = "資料載入失敗,請確認以本地伺服器開啟(見 README)。";
    });
})();
