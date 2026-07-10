(function () {
  "use strict";

  var DATA_URL = "data/playlists.json";
  var VIEW_MODE_KEY = "psViewMode";

  var state = {
    data: null,
    viewMode: "index"
  };

  function isMobile() {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function familyById(id) {
    return state.data.families.find(function (f) { return f.id === id; });
  }

  function coverSrc(slug) {
    return "covers/" + slug + ".jpg";
  }

  function initials(name) {
    var words = name.trim().split(/\s+/);
    var chars = words.map(function (w) { return w[0]; }).join("");
    return chars.slice(0, 3).toUpperCase();
  }

  function makeCoverImg(playlist, className) {
    var img = document.createElement("img");
    img.className = className;
    img.src = coverSrc(playlist.slug);
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
    return "https://open.spotify.com/embed/playlist/" + playlist.spotifyId + "?theme=0";
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

  function makeOpenLink(playlist) {
    var a = document.createElement("a");
    a.className = "open-link";
    a.href = openLink(playlist);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "在 spotify 開啟 ↗";
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

    var cover = makeCoverImg(featured, "featured-card__cover");
    card.appendChild(cover);

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
    play.textContent = "播放 ▶";
    card.appendChild(play);

    container.appendChild(card);
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
        handleRowClick(playlist, panel);
      });

      container.appendChild(row);
    });
  }

  function buildPanelContent(playlist, panel) {
    var inner = document.createElement("div");
    inner.className = "index-row__panel-inner";

    var cover = makeCoverImg(playlist, "index-row__cover");
    inner.appendChild(cover);

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

  function handleRowClick(playlist, panel) {
    if (isMobile()) {
      window.open(openLink(playlist), "_blank", "noopener,noreferrer");
      return;
    }
    var isOpen = panel.classList.contains("is-open");
    document.querySelectorAll(".index-row__panel.is-open, .wall-card__panel.is-open").forEach(function (p) {
      if (p !== panel) {
        p.classList.remove("is-open");
        p.innerHTML = "";
      }
    });
    if (isOpen) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
    } else {
      panel.innerHTML = "";
      buildPanelContent(playlist, panel);
      panel.classList.add("is-open");
    }
  }

  /* ---- wall mode ---- */

  function renderWall() {
    var container = document.getElementById("wall-families");
    container.innerHTML = "";

    state.data.families.forEach(function (fam) {
      var playlists = state.data.playlists.filter(function (p) { return p.family === fam.id; });
      if (playlists.length === 0) return;

      var section = document.createElement("div");
      section.className = "wall-family";

      var label = document.createElement("div");
      label.className = "wall-family__label";
      label.dataset.family = fam.id;
      label.textContent = fam.label;
      section.appendChild(label);

      var grid = document.createElement("div");
      grid.className = "wall-grid";

      playlists.forEach(function (playlist) {
        grid.appendChild(makeWallCard(playlist));
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
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

    var desc = document.createElement("div");
    desc.className = "wall-card__desc";
    desc.textContent = playlist.description;
    card.appendChild(desc);

    if (playlist.followers !== null && playlist.followers !== undefined) {
      var followers = document.createElement("div");
      followers.className = "wall-card__followers";
      followers.textContent = playlist.followers + " 名粉絲";
      card.appendChild(followers);
    }

    var panel = document.createElement("div");
    panel.className = "wall-card__panel";
    card.appendChild(panel);

    coverWrap.addEventListener("click", function () {
      handleWallCardClick(playlist, panel);
    });

    return card;
  }

  function handleWallCardClick(playlist, panel) {
    if (isMobile()) {
      window.open(openLink(playlist), "_blank", "noopener,noreferrer");
      return;
    }
    var isOpen = panel.classList.contains("is-open");
    document.querySelectorAll(".index-row__panel.is-open, .wall-card__panel.is-open").forEach(function (p) {
      if (p !== panel) {
        p.classList.remove("is-open");
        p.innerHTML = "";
      }
    });
    if (isOpen) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
    } else {
      var inner = document.createElement("div");
      inner.className = "wall-card__panel-inner";
      inner.appendChild(makeEmbedWrap(playlist));
      var actions = document.createElement("div");
      actions.className = "embed-actions";
      actions.appendChild(makeOpenLink(playlist));
      inner.appendChild(actions);
      panel.innerHTML = "";
      panel.appendChild(inner);
      panel.classList.add("is-open");
    }
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
