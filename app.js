const {
  channels,
  comments,
  filterTabs,
  videos,
  featuredVideoId,
  shortsVideoIds,
  exploreCollections,
  playlists,
  historyVideoIds,
  likedVideoIds,
  subscriptionSidebarChannels
} = window.YoutubeCloneData || {};

const shortsList = Array.isArray(shortsVideoIds) ? shortsVideoIds : [];
const exploreRows = Array.isArray(exploreCollections) ? exploreCollections : [];
const playlistData = Array.isArray(playlists) ? playlists : [];
const historyIds = Array.isArray(historyVideoIds) ? historyVideoIds : [];
const likedIds = Array.isArray(likedVideoIds) ? likedVideoIds : [];
const subSidebarList = Array.isArray(subscriptionSidebarChannels) ? subscriptionSidebarChannels : [];

const app = document.querySelector("#app");
const safeTheme = getStoredTheme();

const state = {
  route: parseRoute(),
  sidebarOpen: false,
  homeFilter: "All",
  theme: safeTheme || "dark"
};

document.body.dataset.theme = state.theme;
applyMobileLockClass();
enforceViewportForMobileLock();

function parseRoute() {
  const hash = window.location.hash.replace("#", "") || "/";
  const [path, queryString] = hash.split("?");
  const query = new URLSearchParams(queryString || "");
  return { path, query };
}

function applyMobileLockClass() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    const byQuery = params.get("mobile") === "1";
    const byFilename = /\/mobile\.html$/i.test(window.location.pathname || "");
    const forced = byQuery || byFilename;
    const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const ua = navigator.userAgent || "";
    const uaMobile = /iPhone|iPad|iPod|Android|Mobile|CriOS|FxiOS/i.test(ua);
    const touchCapable = coarsePointer || navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const vv = window.visualViewport?.width || Infinity;
    const viewport = Math.min(window.innerWidth || Infinity, window.screen?.width || Infinity, vv);
    const shouldLock = forced || (touchCapable && (uaMobile || viewport <= 1024));
    document.body.classList.toggle("mobile-lock", shouldLock);
  } catch (error) {
    // Ignore unsupported browser capabilities checks.
  }
}

function enforceViewportForMobileLock() {
  try {
    const locked = document.body.classList.contains("mobile-lock");
    if (!locked) return;
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  } catch (error) {
    // Ignore viewport enforcement failures.
  }
}

function navigate(path) {
  window.location.hash = path;
}

window.addEventListener("hashchange", () => {
  state.route = parseRoute();
  render();
});

window.addEventListener("resize", () => {
  applyMobileLockClass();
  enforceViewportForMobileLock();
});

function getStoredTheme() {
  try {
    return window.localStorage.getItem("youtube-clone-theme") || window.localStorage.getItem("streamline-theme");
  } catch (error) {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem("youtube-clone-theme", theme);
  } catch (error) {
    // Ignore file-origin storage restrictions.
  }
}

function icon(name) {
  const icons = {
    menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
    search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.2-3.2"></path></svg>`,
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5v11h14v-11"/></svg>`,
    trending: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>`,
    subs: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M10 10l5 2-5 2z"/></svg>`,
    library: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M10 9h6M10 13h6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/></svg>`,
    like: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9V5a3 3 0 00-3-3l-1 6H5v13h12.5a2 2 0 002-1.6l1.2-6A2 2 0 0018.8 11H14z"/><path d="M5 8H2v13h3"/></svg>`,
    dislike: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 15v4a3 3 0 003 3l1-6h5a2 2 0 002-2.4l-1.2-6A2 2 0 0017.8 6H5.3a2 2 0 00-2 1.6L2 14a2 2 0 002 2h6z"/><path d="M19 6h3v13h-3"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    share: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>`,
    play: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z" stroke="none"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" stroke-linejoin="round"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>`,
    libraryIcon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/></svg>`,
    list: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`
  };
  return icons[name] || "";
}

function getVideoById(id) {
  return videos.find((v) => v.id === id);
}

function channelInitial(name) {
  const trimmed = String(name || "").replace(/^The\s+/i, "").trim();
  return (trimmed.charAt(0) || "?").toUpperCase();
}

function hueForSeed(seed) {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i += 1) {
    h = s.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
}

function letterAvatarHtml(name, seed) {
  const letter = channelInitial(name);
  const hue = hueForSeed(seed || name);
  const bg = `hsl(${hue} 58% 42%)`;
  return `<span class="letter-avatar" style="--letter-bg:${bg}" aria-hidden="true">${letter}</span>`;
}

function categoryStripHtml() {
  if (state.route.path !== "/") return "";
  return `
    <div class="category-strip-wrap">
      <div class="category-strip" role="tablist" aria-label="Categories">
        ${filterTabs
          .map(
            (tab) => `
          <button type="button" class="category-tab ${tab === state.homeFilter ? "active" : ""}" data-action="homeFilter" data-value="${tab}" role="tab" aria-selected="${tab === state.homeFilter}">
            ${tab}
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function subscriptionSidebarHtml() {
  if (!subSidebarList.length) return "";
  return `
    <div class="sidebar-subscriptions">
      <p class="sidebar-section-label">Subscriptions</p>
      <div class="sidebar-sub-list">
        ${subSidebarList
          .map(
            (ch) => `
          <button type="button" class="sidebar-sub-channel text-btn" data-to="/channel?id=${ch.id}">
            ${letterAvatarHtml(ch.name, ch.id)}
            <span class="sidebar-sub-name">${ch.name}</span>
          </button>
        `
          )
          .join("")}
      </div>
      <button type="button" class="sidebar-show-more">Show more</button>
    </div>
  `;
}

function navClass(path) {
  const p = state.route.path;
  if (path === "/" && p === "/") return "active";
  if (path !== "/" && p === path) return "active";
  return "";
}

function getChannel(channelId) {
  const found = channels.find((channel) => channel.id === channelId);
  if (found) return found;
  return {
    id: channelId,
    name: "Creator",
    subscribers: "Channel",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    banner:
      channels[0]?.banner ||
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
    about: ""
  };
}

function card(video) {
  return `
    <article class="video-card" data-video="${video.id}">
      <button class="thumbnail-btn" data-to="/watch?v=${video.id}" aria-label="Open ${video.title}">
        <img src="${video.thumbnail}" alt="" loading="lazy" />
        <span class="duration-pill">${video.duration}</span>
      </button>
      <div class="video-card-details">
        <div class="video-card-meta-row">
          ${letterAvatarHtml(video.channelName, video.channelId)}
          <div class="video-meta-stack">
            <button class="text-btn video-card-title" data-to="/watch?v=${video.id}">${video.title}</button>
            <button class="text-btn video-card-channel" data-to="/channel?id=${video.channelId}">${video.channelName}</button>
            <p class="video-card-stats"><span>${video.views}</span><span class="video-stat-sep">·</span><span>${video.uploadedAt}</span></p>
          </div>
        </div>
      </div>
    </article>
  `;
}

function appShell(content, pageClass = "") {
  const isDark = state.theme === "dark";
  const queryValue = state.route.query.get("q") || "";

  const onHome = state.route.path === "/";

  return `
    <div class="layout ${state.sidebarOpen ? "sidebar-open" : ""} ${onHome ? "layout--home" : ""}">
      <div class="sidebar-backdrop" data-action="closeSidebar" aria-hidden="true"></div>
      <header class="site-header">
        <div class="top-nav">
          <div class="top-nav-inner">
            <div class="top-nav-left">
              <button class="icon-btn" data-action="toggleSidebar" aria-label="Toggle sidebar">
                ${icon("menu")}
              </button>
              <button class="brand text-btn" data-to="/" aria-label="Youtube-clone home">
                <span class="brand-mark" aria-hidden="true">${icon("play")}</span>
                <span class="brand-text">Youtube-clone</span>
              </button>
            </div>
            <form class="search-wrap" data-action="searchSubmit" role="search">
              ${icon("search")}
              <input value="${queryValue}" type="search" placeholder="Search" name="q" autocomplete="off" enterkeyhint="search" />
            </form>
            <div class="top-nav-right">
              <button class="icon-btn" data-action="toggleTheme" aria-label="Toggle theme">
                ${isDark ? icon("sun") : icon("moon")}
              </button>
              <button class="profile-chip" type="button">${icon("user")}<span class="profile-label">You</span></button>
            </div>
          </div>
        </div>
        ${categoryStripHtml()}
      </header>
      <aside class="sidebar" aria-label="Main navigation">
        <nav class="sidebar-nav-main">
          <button class="sidebar-link text-btn ${navClass("/")}" data-to="/">${icon("home")}<span>Home</span></button>
          <button class="sidebar-link text-btn ${navClass("/explore")}" data-to="/explore">${icon("compass")}<span>Explore</span></button>
          <button class="sidebar-link text-btn ${navClass("/shorts")}" data-to="/shorts">${icon("bolt")}<span>Shorts</span></button>
          <button class="sidebar-link text-btn ${navClass("/subscriptions")}" data-to="/subscriptions">${icon("subs")}<span>Subscriptions</span></button>
          <button class="sidebar-link text-btn ${navClass("/library")}" data-to="/library">${icon("libraryIcon")}<span>Library</span></button>
        </nav>
        ${subscriptionSidebarHtml()}
      </aside>
      <main class="content ${pageClass}">
        ${content}
      </main>
      <footer class="site-footer">
        <div class="footer-inner">
          <span class="footer-brand">Youtube-clone</span>
          <nav class="footer-links" aria-label="Footer">
            <a href="#" class="footer-link">About</a>
            <a href="#" class="footer-link">Press</a>
            <a href="#" class="footer-link">Copyright</a>
            <a href="#" class="footer-link">Contact</a>
          </nav>
          <p class="footer-note">Portfolio demo · No affiliation with YouTube</p>
        </div>
      </footer>
    </div>
  `;
}

function railCard(video) {
  const ch = getChannel(video.channelId);
  return `
    <article class="rail-card">
      <button class="thumbnail-btn rail-thumb" data-to="/watch?v=${video.id}" aria-label="${video.title}">
        <img src="${video.thumbnail}" alt="" loading="lazy" />
        <span class="duration-pill">${video.duration}</span>
      </button>
      <div class="rail-card-meta">
        <button class="text-btn title-link rail-card-title" data-to="/watch?v=${video.id}">${video.title}</button>
        <p class="muted">${ch.name}</p>
      </div>
    </article>
  `;
}

function homePage() {
  const filtered = state.homeFilter === "All"
    ? videos
    : videos.filter((video) => video.category === state.homeFilter);

  const featured = getVideoById(featuredVideoId) || videos[0];
  const featCh = featured ? getChannel(featured.channelId) : null;
  const heroBg = featured?.thumbnail || "";

  return appShell(
    `
      ${
        featured && featCh
          ? `
      <section class="home-hero-banner" style="--hero-image: url('${heroBg}')" aria-labelledby="hero-title">
        <div class="home-hero-blur" aria-hidden="true"></div>
        <div class="home-hero-overlay" aria-hidden="true"></div>
        <div class="home-hero-inner">
          <p class="home-hero-label" id="hero-kicker">Featured</p>
          <h2 class="home-hero-title" id="hero-title">${featured.title}</h2>
          <p class="home-hero-channel">${featCh.name}</p>
          <p class="home-hero-views">${featured.views}</p>
          <div class="home-hero-actions">
            <button type="button" class="btn-hero-primary" data-to="/watch?v=${featured.id}">Watch</button>
            <button type="button" class="btn-hero-secondary" data-to="/explore">Browse Explore</button>
          </div>
        </div>
      </section>
      `
          : ""
      }
      <section class="video-grid video-grid--feed" aria-label="Videos">
        ${filtered.map(card).join("")}
      </section>
    `,
    "home-page"
  );
}

function explorePage() {
  const blocks = exploreRows
    .map(
      (col) => `
      <section class="explore-block">
        <header class="explore-block-head">
          <div>
            <h2 class="explore-block-title">${col.name}</h2>
            <p class="explore-block-blurb">${col.blurb}</p>
          </div>
          <button type="button" class="btn-ghost btn-sm" data-to="/search?q=${encodeURIComponent(col.name)}">Open topic</button>
        </header>
        <div class="explore-row">
          ${col.videoIds
            .map((id) => {
              const v = getVideoById(id);
              return v ? railCard(v) : "";
            })
            .join("")}
        </div>
      </section>
    `
    )
    .join("");

  return appShell(
    `
      <header class="page-header">
        <h1 class="page-title">Explore</h1>
        <p class="page-lead">Jump into themed rows—same catalog, organized like a real browse experience.</p>
      </header>
      <div class="explore-top-chips">
        ${filterTabs
          .filter((t) => t !== "All")
          .map(
            (t) => `
          <button type="button" class="chip" data-to="/search?q=${encodeURIComponent(t)}">${t}</button>
        `
          )
          .join("")}
      </div>
      ${blocks}
    `,
    "explore-page"
  );
}

function shortsPage() {
  const list = shortsList
    .map((id) => getVideoById(id))
    .filter(Boolean);

  return appShell(
    `
      <header class="page-header">
        <h1 class="page-title">Shorts</h1>
        <p class="page-lead">Vertical feed preview—tap any tile to open the watch page.</p>
      </header>
      <section class="shorts-grid" aria-label="Shorts">
        ${list
          .map(
            (video) => `
          <button type="button" class="shorts-tile" data-to="/watch?v=${video.id}">
            <div class="shorts-frame">
              <img src="${video.thumbnail}" alt="" loading="lazy" />
              <span class="shorts-views">${video.views}</span>
            </div>
            <p class="shorts-caption">${video.title}</p>
          </button>
        `
          )
          .join("")}
      </section>
    `,
    "shorts-page"
  );
}

function libraryPage() {
  const historyItems = historyIds.map((id) => getVideoById(id)).filter(Boolean);
  const likedItems = likedIds.map((id) => getVideoById(id)).filter(Boolean);

  return appShell(
    `
      <header class="page-header">
        <h1 class="page-title">Library</h1>
        <p class="page-lead">History, playlists, and likes—structured like the real app.</p>
      </header>
      <div class="library-layout">
        <section class="library-panel">
          <h2 class="library-panel-title">${icon("list")} Playlists</h2>
          <ul class="playlist-list">
            ${playlistData
              .map((pl) => {
                const cover = getVideoById(pl.coverVideoId);
                const thumb = cover?.thumbnail || "";
                return `
              <li>
                <button type="button" class="playlist-row" data-to="/watch?v=${pl.coverVideoId}">
                  <span class="playlist-cover"><img src="${thumb}" alt="" /></span>
                  <span class="playlist-info">
                    <span class="playlist-name">${pl.title}</span>
                    <span class="muted">${pl.videoCount} videos</span>
                  </span>
                </button>
              </li>
            `;
              })
              .join("")}
          </ul>
        </section>
        <section class="library-panel">
          <h2 class="library-panel-title">History</h2>
          <div class="library-mini-grid">
            ${historyItems.map(card).join("")}
          </div>
        </section>
        <section class="library-panel">
          <h2 class="library-panel-title">Liked videos</h2>
          <div class="library-mini-grid">
            ${likedItems.length ? likedItems.map(card).join("") : `<p class="muted empty-inline">No likes yet—heart something on the watch page.</p>`}
          </div>
        </section>
      </div>
    `,
    "library-page"
  );
}

function subscriptionsPage() {
  const rows = channels
    .map((ch) => {
      const latest = videos.filter((v) => v.channelId === ch.id).slice(0, 3);
      return `
      <section class="sub-feed-block">
        <header class="sub-feed-head">
          <button type="button" class="sub-channel" data-to="/channel?id=${ch.id}">
            <img class="sub-avatar" src="${ch.avatar}" alt="" width="40" height="40" />
            <span class="sub-name">${ch.name}</span>
            <span class="muted sub-subs">${ch.subscribers}</span>
          </button>
        </header>
        <div class="sub-feed-row">
          ${latest.map(railCard).join("")}
        </div>
      </section>
    `;
    })
    .join("");

  return appShell(
    `
      <header class="page-header">
        <h1 class="page-title">Subscriptions</h1>
        <p class="page-lead">Latest uploads from channels you follow—one row per creator.</p>
      </header>
      <div class="sub-channel-strip" aria-label="Subscribed channels">
        ${channels
          .map(
            (ch) => `
          <button type="button" class="sub-pill" data-to="/channel?id=${ch.id}">
            <img src="${ch.avatar}" alt="" width="32" height="32" />
            <span>${ch.name}</span>
          </button>
        `
          )
          .join("")}
      </div>
      ${rows}
    `,
    "subscriptions-page"
  );
}

function watchPage() {
  const id = state.route.query.get("v") || videos[0].id;
  const activeVideo = videos.find((video) => video.id === id) || videos[0];
  const channel = getChannel(activeVideo.channelId);
  const recommended = videos.filter((video) => video.id !== activeVideo.id);

  return appShell(
    `
      <section class="watch-layout">
        <article class="player-column">
          <div class="player-wrap">
            <iframe
              src="https://www.youtube.com/embed/${activeVideo.embedId}"
              title="${activeVideo.title}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <h1 class="watch-title">${activeVideo.title}</h1>
          <p class="watch-stats muted">${activeVideo.views} · ${activeVideo.uploadedAt}</p>
          <div class="watch-meta-row">
            <div class="watch-channel-block">
              <img class="watch-channel-avatar" src="${channel.avatar}" alt="" width="40" height="40" />
              <div>
                <button class="text-btn channel-link lg" data-to="/channel?id=${channel.id}">${channel.name}</button>
                <p class="muted">${channel.subscribers}</p>
              </div>
              <button type="button" class="subscribe-btn subscribe-btn-inline">Subscribe</button>
            </div>
            <div class="actions-row">
              <button type="button" class="action-btn" aria-label="Like">${icon("like")}<span class="action-label">Like</span></button>
              <button type="button" class="action-btn" aria-label="Dislike">${icon("dislike")}<span class="action-label">Dislike</span></button>
              <button type="button" class="action-btn action-btn-share" aria-label="Share">${icon("share")}<span class="action-label">Share</span></button>
            </div>
          </div>
          <details class="description-box">
            <summary>Description</summary>
            <p>${activeVideo.description}</p>
            <p class="muted">${activeVideo.views} • ${activeVideo.uploadedAt}</p>
          </details>
          <section class="comments-wrap">
            <h2>Comments</h2>
            ${comments
              .map(
                (comment) => `
                  <article class="comment-item">
                    <p><strong>${comment.user}</strong> <span class="muted">• ${comment.age}</span></p>
                    <p>${comment.text}</p>
                  </article>
                `
              )
              .join("")}
          </section>
        </article>
        <aside class="recommend-column">
          <h3>Up Next</h3>
          ${recommended
            .map(
              (video) => `
                <article class="recommend-card">
                  <button class="thumbnail-btn small" data-to="/watch?v=${video.id}">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
                    <span class="duration-pill">${video.duration}</span>
                  </button>
                  <div>
                    <button class="text-btn title-link sm" data-to="/watch?v=${video.id}">${video.title}</button>
                    <button class="text-btn channel-link" data-to="/channel?id=${video.channelId}">${video.channelName}</button>
                    <p class="muted">${video.views}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </aside>
      </section>
    `,
    "watch-page"
  );
}

function searchPage() {
  const query = (state.route.query.get("q") || "").toLowerCase();
  const results = videos.filter((video) =>
    `${video.title} ${video.channelName} ${video.category}`.toLowerCase().includes(query)
  );

  return appShell(
    `
      <section class="result-filters">
        <button class="ghost-pill">Upload date</button>
        <button class="ghost-pill">Type</button>
        <button class="ghost-pill">Duration</button>
        <button class="ghost-pill">Sort by</button>
      </section>
      <section class="results-list">
        ${results
          .map(
            (video) => `
              <article class="result-item">
                <button class="thumbnail-btn result" data-to="/watch?v=${video.id}">
                  <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
                  <span class="duration-pill">${video.duration}</span>
                </button>
                <div class="result-info">
                  <button class="text-btn title-link lg" data-to="/watch?v=${video.id}">${video.title}</button>
                  <p class="muted">${video.views} • ${video.uploadedAt} • ${video.category}</p>
                  <button class="text-btn channel-link" data-to="/channel?id=${video.channelId}">${video.channelName}</button>
                  <p>${video.description}</p>
                </div>
              </article>
            `
          )
          .join("")}
        ${results.length === 0 ? `<p class="empty-state">No videos matched your search.</p>` : ""}
      </section>
    `,
    "search-page"
  );
}

function channelPage() {
  const id = state.route.query.get("id") || channels[0].id;
  const channel = getChannel(id);
  const channelVideos = videos.filter((video) => video.channelId === channel.id);

  return appShell(
    `
      <section class="channel-head">
        <img class="channel-banner" src="${channel.banner}" alt="${channel.name} banner" />
        <div class="channel-meta">
          <img class="channel-avatar" src="${channel.avatar}" alt="${channel.name}" />
          <div>
            <h1>${channel.name}</h1>
            <p class="muted">${channel.subscribers}</p>
          </div>
          <button class="subscribe-btn">Subscribe</button>
        </div>
        <div class="channel-tabs">
          <button class="tab-btn active">Videos</button>
          <button class="tab-btn">Playlists</button>
          <button class="tab-btn">About</button>
        </div>
      </section>
      <section class="video-grid">
        ${channelVideos.map(card).join("")}
      </section>
      <section class="about-panel">
        <h3>About</h3>
        <p>${channel.about}</p>
      </section>
    `,
    "channel-page"
  );
}

function notFoundPage() {
  return appShell(
    `
      <section class="empty-state">
        <h1>Page not found</h1>
        <p>Return home to continue browsing.</p>
        <button class="action-btn" data-to="/">Go home</button>
      </section>
    `
  );
}

function getView() {
  switch (state.route.path) {
    case "/":
      return homePage();
    case "/explore":
      return explorePage();
    case "/shorts":
      return shortsPage();
    case "/library":
      return libraryPage();
    case "/subscriptions":
      return subscriptionsPage();
    case "/watch":
      return watchPage();
    case "/search":
      return searchPage();
    case "/channel":
      return channelPage();
    default:
      return notFoundPage();
  }
}

function attachHandlers() {
  app.querySelectorAll("[data-to]").forEach((node) => {
    node.addEventListener("click", () => {
      navigate(node.dataset.to);
      state.sidebarOpen = false;
    });
  });

  app.querySelectorAll('[data-action="homeFilter"]').forEach((node) => {
    node.addEventListener("click", () => {
      state.homeFilter = node.dataset.value;
      render();
    });
  });

  const sidebarTrigger = app.querySelector('[data-action="toggleSidebar"]');
  if (sidebarTrigger) {
    sidebarTrigger.addEventListener("click", () => {
      state.sidebarOpen = !state.sidebarOpen;
      render();
    });
  }

  const sidebarBackdrop = app.querySelector('[data-action="closeSidebar"]');
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", () => {
      state.sidebarOpen = false;
      render();
    });
  }

  const themeTrigger = app.querySelector('[data-action="toggleTheme"]');
  if (themeTrigger) {
    themeTrigger.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      setStoredTheme(state.theme);
      document.body.dataset.theme = state.theme;
      render();
    });
  }

  const form = app.querySelector('[data-action="searchSubmit"]');
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      navigate(`/search?q=${encodeURIComponent(input.value.trim())}`);
    });
  }
}

function render() {
  if (!app) return;
  if (!Array.isArray(videos) || !Array.isArray(channels) || !Array.isArray(filterTabs) || !Array.isArray(comments)) {
    app.innerHTML = `
      <section class="empty-state" style="margin: 24px;">
        <h1>Unable to load app data</h1>
        <p>Refresh the page. If this persists, open this folder using a local server.</p>
      </section>
    `;
    return;
  }
  app.innerHTML = getView();
  attachHandlers();
}

render();
