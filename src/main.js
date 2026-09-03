import "./style.css";
import { REGIONS, stores } from "./stores.js";
import { DRAW_CITY_FILTERS, draws as bundledDraws } from "./draws.js";
import { fetchRemoteDraws, titleToEventChip } from "./parse-remote-draws.js";

const SITE_AUTHOR = "Frank CHU";
const SITE_UPDATED_AT = "2026-09-03T21:21:00+08:00";

const listEl = document.getElementById("store-list");
const empty = document.getElementById("empty");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search");
const locateBtn = document.getElementById("locate-btn");
const syncBtn = document.getElementById("sync-btn");
const syncMeta = document.getElementById("sync-meta");
const eventChip = document.getElementById("event-chip");
const filtersEl = document.getElementById("region-filters");
const pageNav = document.getElementById("page-nav");
const backTopBtn = document.getElementById("back-top");
const listActionsEl = document.getElementById("draw-list-actions");
const incompleteToggle = document.getElementById("incomplete-toggle");
const VISITED_KEY = "visited_draw_urls";
const COLLAPSED_KEY = "collapsed_draw_ids";
const SYNC_AT_KEY = "draws_synced_at";
const LIVE_DRAWS_KEY = "live_draws_cache";
const SYNC_COOLDOWN_MS = 5_000;

/** @type {typeof bundledDraws} */
let draws = loadInitialDraws();
let syncCooldownUntil = 0;
let syncCooldownTimer = 0;

function loadInitialDraws() {
  try {
    const cached = JSON.parse(localStorage.getItem(LIVE_DRAWS_KEY) || "null");
    if (Array.isArray(cached) && cached.length) return cached;
  } catch {
    /* ignore bad cache */
  }
  return bundledDraws;
}

function persistLiveDraws() {
  localStorage.setItem(LIVE_DRAWS_KEY, JSON.stringify(draws));
}

function pageFromHash() {
  return location.hash === "#stores" ? "stores" : "draws";
}

const state = {
  page: pageFromHash(),
  region: "all",
  city: "all",
  query: "",
  onlyIncomplete: false,
  userLocation: null,
  nearestId: null,
  geoError: "",
  visited: new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]")),
  collapsed: new Set(JSON.parse(localStorage.getItem(COLLAPSED_KEY) || "[]")),
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (n) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

function regionMeta(id) {
  return REGIONS.find((region) => region.id === id);
}

function mapsUrl(store) {
  if (store.lat != null && store.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
  }
  const q = encodeURIComponent(`${store.mall} ${store.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function withDistance(list) {
  if (!state.userLocation) {
    return list.map((store) => ({ ...store, distanceKm: null }));
  }
  const { lat, lng } = state.userLocation;
  return list.map((store) => ({
    ...store,
    distanceKm: haversineKm(lat, lng, store.lat, store.lng),
  }));
}

function filteredStores() {
  const query = state.query.trim().toLowerCase();
  let list = withDistance(stores);

  if (state.region !== "all") {
    list = list.filter((store) => store.region === state.region);
  }

  if (query) {
    list = list.filter((store) => {
      const haystack = `${store.name} ${store.mall} ${store.city}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  list.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    if (a.region === b.region) return a.name.localeCompare(b.name, "zh-Hant");
    return REGIONS.findIndex((r) => r.id === a.region) - REGIONS.findIndex((r) => r.id === b.region);
  });

  return list;
}

function renderFilters() {
  if (state.page === "draws") {
    const chips = [
      { id: "all", label: "全部", count: draws.length },
      ...DRAW_CITY_FILTERS.map((filter) => ({
        id: filter.id,
        label: filter.label,
        count: draws.filter((store) => filter.cities.includes(store.city)).length,
      })),
    ];
    filtersEl.innerHTML = chips
      .map((chip) => {
        const activeClass = state.city === chip.id ? "is-active" : "";
        return `
          <button type="button" data-city="${chip.id}" class="${activeClass}">
            ${chip.label} <span class="count">${chip.count}</span>
          </button>
        `;
      })
      .join("");
    return;
  }

  const counts = Object.fromEntries(REGIONS.map((r) => [r.id, stores.filter((s) => s.region === r.id).length]));
  const chips = [
    { id: "all", label: "全部", count: stores.length },
    ...REGIONS.map((region) => ({
      id: region.id,
      label: region.label,
      count: counts[region.id],
    })),
  ];

  filtersEl.innerHTML = chips
    .map((chip) => {
      const activeClass = state.region === chip.id ? "is-active" : "";
      return `
        <button type="button" data-region="${chip.id}" class="${activeClass}">
          ${chip.label} <span class="count">${chip.count}</span>
        </button>
      `;
    })
    .join("");
}

const iconPlus = `<svg class="icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>`;
const iconOut = `<svg class="icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M5 2h5v5M10 2 5 7M2 4.5V10h5.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
const iconPin = `<svg class="icon" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 1v2.2M6 8.8V11M1 6h2.2M8.8 6H11" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/></svg>`;

function cardHtml(store, isNearest) {
  const distanceLabel = store.distanceKm != null ? formatDistance(store.distanceKm) : "";
  const nearest = isNearest
    ? `<p class="nearest-mark">● 距離最近${distanceLabel ? ` · ${distanceLabel}` : ""}</p>`
    : "";
  const distance =
    !isNearest && distanceLabel ? `<p class="store-distance">${distanceLabel}</p>` : "";

  return `
    <article class="store-card${isNearest ? " is-nearest" : ""}">
      <div class="store-copy">
        ${nearest}
        <h3 class="store-name">${store.name}</h3>
        <p class="store-mall">${store.mall}</p>
        ${distance}
      </div>
      <div class="store-actions">
        <a class="action-btn line-btn" href="${store.line}" target="_blank" rel="noopener noreferrer">${iconPlus} 加入 LINE</a>
        ${
          store.facebook
            ? `<a class="action-btn secondary-btn" href="${store.facebook}" target="_blank" rel="noopener noreferrer">${iconOut} 粉專</a>`
            : ""
        }
        <a class="action-btn secondary-btn" href="${mapsUrl(store)}" target="_blank" rel="noopener noreferrer">${iconPin} 地圖</a>
      </div>
    </article>
  `;
}

function groupBlock(title, items, nearestId) {
  return `
    <section class="store-group">
      <h2 class="group-label">${title} <span class="count">· ${items.length} 間</span></h2>
      <div class="store-grid">
        ${items.map((store) => cardHtml(store, store.id === nearestId)).join("")}
      </div>
    </section>
  `;
}

function groupedHtml(list, nearestId) {
  if (state.userLocation) {
    return groupBlock("依距離", list, nearestId);
  }

  const groups = [];
  for (const store of list) {
    const last = groups[groups.length - 1];
    if (!last || last.id !== store.region) {
      groups.push({ id: store.region, items: [store] });
    } else {
      last.items.push(store);
    }
  }

  return groups
    .map((group) => groupBlock(regionMeta(group.id).label, group.items, nearestId))
    .join("");
}

function renderStatus(list) {
  if (state.page === "draws") {
    const linkCount = list.reduce((n, store) => n + store.items.length, 0);
    const remaining = list.reduce(
      (n, store) => n + store.items.filter((item) => !state.visited.has(item.url)).length,
      0
    );
    const mode = state.onlyIncomplete ? " · 只看未抽完" : "";
    statusEl.textContent = `共 ${list.length} 家門市 · ${linkCount} 個連結 · 未抽 ${remaining}${mode}`;
    return;
  }
  if (state.geoError) {
    statusEl.textContent = state.geoError;
    return;
  }
  if (state.userLocation && state.nearestId) {
    const nearest = stores.find((store) => store.id === state.nearestId);
    const shownNearest = list[0];
    if (state.region === "all" && !state.query && shownNearest) {
      statusEl.textContent = `已依距離排序 · 最近是 ${nearest.name}（${formatDistance(shownNearest.distanceKm)}）`;
      return;
    }
    statusEl.textContent = `已取得定位，目前顯示 ${list.length} 家門市`;
    return;
  }
  statusEl.textContent = `共 ${list.length} 家可加入 LINE 抽選的門市`;
}

function renderListActions(listLength) {
  if (!listActionsEl) return;
  const show = state.page === "draws" && (listLength > 0 || state.onlyIncomplete);
  listActionsEl.hidden = !show;
  incompleteToggle?.classList.toggle("is-active", state.onlyIncomplete);
  if (incompleteToggle) {
    incompleteToggle.setAttribute("aria-pressed", state.onlyIncomplete ? "true" : "false");
  }
}

function setFoldAll(collapse) {
  const list = filteredDraws();
  for (const store of list) {
    if (collapse) state.collapsed.add(store.id);
    else state.collapsed.delete(store.id);
  }
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...state.collapsed]));
  render();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightProduct(product, query) {
  const safe = escapeHtml(product);
  if (!query) return safe;
  const lower = product.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx < 0) return safe;
  const end = idx + query.length;
  return `${escapeHtml(product.slice(0, idx))}<mark class="draw-match">${escapeHtml(product.slice(idx, end))}</mark>${escapeHtml(product.slice(end))}`;
}

function storeIsComplete(store) {
  return store.items.length > 0 && store.items.every((item) => state.visited.has(item.url));
}

function storeHasSearchHit(store, query) {
  if (!query) return false;
  if (store.name.toLowerCase().includes(query) || store.city.toLowerCase().includes(query)) {
    return true;
  }
  return store.items.some((item) => item.product.toLowerCase().includes(query));
}

function renderPageNav() {
  pageNav.innerHTML = `
    <button type="button" data-page="draws" class="${state.page === "draws" ? "is-active" : ""}">
      陀螺抽選 <span class="count">${draws.length}</span>
    </button>
    <button type="button" data-page="stores" class="${state.page === "stores" ? "is-active" : ""}">
      LINE 門市 <span class="count">${stores.length}</span>
    </button>
  `;
}

function citiesForFilter(id) {
  if (id === "all") return null;
  return DRAW_CITY_FILTERS.find((filter) => filter.id === id)?.cities ?? [id];
}

function filteredDraws() {
  const query = state.query.trim().toLowerCase();
  let list = draws.slice();
  const cities = citiesForFilter(state.city);

  if (cities) {
    list = list.filter((store) => cities.includes(store.city));
  }

  if (query) {
    list = list.filter((store) => storeHasSearchHit(store, query));
  }

  if (state.onlyIncomplete) {
    list = list.filter((store) => !storeIsComplete(store));
  }

  return list;
}

function shouldOpenLineInSameTab() {
  const ua = navigator.userAgent;
  if (/iPhone|iPod|Android/i.test(ua)) return true;
  if (/iPad/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function drawLinkTargetAttrs() {
  if (shouldOpenLineInSameTab()) return "";
  return ` target="_blank" rel="noopener noreferrer"`;
}

function drawCardHtml(store) {
  const query = state.query.trim().toLowerCase();
  const searchHit = storeHasSearchHit(store, query);
  const notes = store.notes.map((note) => `<p class="draw-note">${escapeHtml(note)}</p>`).join("");
  const orderedItems = query
    ? [...store.items].sort((a, b) => {
        const aHit = a.product.toLowerCase().includes(query) ? 0 : 1;
        const bHit = b.product.toLowerCase().includes(query) ? 0 : 1;
        return aHit - bHit;
      })
    : store.items;
  const items = orderedItems
    .map((item) => {
      const visited = state.visited.has(item.url);
      const visitedClass = visited ? " is-visited" : "";
      const label = visited ? "已抽" : "抽獎";
      return `
        <a class="draw-btn${visitedClass}" href="${item.url}"${drawLinkTargetAttrs()} data-draw-url="${item.url}">
          <span class="draw-product">${highlightProduct(item.product, query)}</span>
          <span class="draw-btn-label">${label}</span>
        </a>
      `;
    })
    .join("");
  const collapsed = state.collapsed.has(store.id) && !searchHit;
  const visitedCount = store.items.filter((item) => state.visited.has(item.url)).length;
  const doneMark = storeIsComplete(store) ? " · 已完成" : "";
  const matchCount = query
    ? store.items.filter((item) => item.product.toLowerCase().includes(query)).length
    : 0;
  const matchMark = matchCount ? ` · 符合 ${matchCount}` : "";

  return `
    <article class="draw-card${collapsed ? " is-collapsed" : ""}" data-draw-id="${store.id}">
      <button type="button" class="draw-card-head" data-draw-toggle="${store.id}" aria-expanded="${collapsed ? "false" : "true"}">
        <span class="draw-card-title">
          <span class="store-name">${escapeHtml(store.name)}</span>
          <span class="draw-card-summary">已抽 ${visitedCount}/${store.items.length}${doneMark}${matchMark}</span>
        </span>
        <span class="draw-chevron" aria-hidden="true"></span>
      </button>
      <div class="draw-card-body-wrap">
        <div class="draw-card-body">
          <p class="draw-meta">${escapeHtml(store.city)} · 抽選時間 ${escapeHtml(store.startTime)}</p>
          ${notes}
          <div class="draw-items">${items}</div>
        </div>
      </div>
    </article>
  `;
}

function groupedDrawHtml(list) {
  const groups = [];
  for (const store of list) {
    const last = groups[groups.length - 1];
    if (!last || last.city !== store.city) {
      groups.push({ city: store.city, items: [store] });
    } else {
      last.items.push(store);
    }
  }

  return groups
    .map(
      (group) => `
        <section class="store-group">
          <h2 class="group-label">${group.city} <span class="count">· ${group.items.length} 間</span></h2>
          <div class="draw-grid">
            ${group.items.map(drawCardHtml).join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function setPage(page) {
  state.page = page;
  state.query = "";
  searchInput.value = "";
  if (page !== "draws") state.onlyIncomplete = false;
  const hash = page === "stores" ? "#stores" : "#draws";
  if (location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
  render();
}

function formatSiteUpdatedAt(iso) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function renderSyncMeta(iso, options = {}) {
  if (!syncMeta) return;
  syncMeta.classList.toggle("is-error", Boolean(options.error));
  if (options.error) {
    syncMeta.textContent = options.error;
    return;
  }
  if (!iso) {
    syncMeta.textContent = "資料更新：尚未同步（點上方按鈕從遠端抓取）";
    return;
  }
  syncMeta.textContent = `資料更新 ${formatSiteUpdatedAt(iso)}`;
}

function updateEventChip(title) {
  if (!eventChip) return;
  const label = titleToEventChip(title);
  if (label) eventChip.textContent = label;
}

function clearSyncCooldownTimer() {
  if (syncCooldownTimer) {
    window.clearInterval(syncCooldownTimer);
    syncCooldownTimer = 0;
  }
}

function syncCooldownRemainingMs() {
  return Math.max(0, syncCooldownUntil - Date.now());
}

function refreshSyncCooldownUi() {
  if (!syncBtn) return;
  const remain = syncCooldownRemainingMs();
  if (remain <= 0) {
    clearSyncCooldownTimer();
    syncBtn.disabled = false;
    syncBtn.classList.remove("is-success");
    syncBtn.textContent = "更新抽選資料";
    return;
  }
  syncBtn.disabled = true;
  syncBtn.textContent = `請稍候 ${Math.ceil(remain / 1000)}s`;
}

function beginSyncCooldown(fromMs = Date.now()) {
  syncCooldownUntil = fromMs + SYNC_COOLDOWN_MS;
  clearSyncCooldownTimer();
  refreshSyncCooldownUi();
  syncCooldownTimer = window.setInterval(refreshSyncCooldownUi, 250);
}

async function syncRemoteDraws() {
  if (!syncBtn) return;
  if (syncCooldownRemainingMs() > 0 || syncBtn.disabled) return;

  syncBtn.disabled = true;
  syncBtn.classList.remove("is-success");
  syncBtn.textContent = "更新中…";
  if (syncMeta) {
    syncMeta.classList.remove("is-error");
    syncMeta.textContent = "正在從遠端抓取最新抽選…";
  }

  try {
    const { title, draws: next } = await fetchRemoteDraws();
    draws = next;
    const syncedAt = new Date().toISOString();
    localStorage.setItem(SYNC_AT_KEY, syncedAt);
    persistLiveDraws();
    updateEventChip(title);
    state.page = "draws";
    if (location.hash !== "#draws") {
      history.replaceState(null, "", "#draws");
    }
    render();
    renderSyncMeta(syncedAt);
    syncBtn.classList.add("is-success");
    syncBtn.textContent = `已更新 ${next.length} 家`;
    statusEl.textContent = `已從遠端同步 ${next.length} 家抽選門市。`;
  } catch (error) {
    const message = error?.message || "同步失敗";
    renderSyncMeta(null, { error: `同步失敗：${message}` });
    syncBtn.classList.remove("is-success");
    statusEl.textContent = `無法更新抽選資料：${message}`;
  } finally {
    beginSyncCooldown();
  }
}

function renderFooter() {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;
  const label = formatSiteUpdatedAt(SITE_UPDATED_AT);
  footer.innerHTML = `
    <p class="footer-credit">作者 ${escapeHtml(SITE_AUTHOR)} · 非官方</p>
    <p class="footer-updated">最後修改 <time datetime="${SITE_UPDATED_AT}">${escapeHtml(label)}</time></p>
  `;
}

function render() {
  document.body.classList.toggle("is-draws", state.page === "draws");
  renderPageNav();
  renderFilters();
  searchInput.placeholder =
    state.page === "draws"
      ? "搜尋門市或品名，例如：忠孝、惡魔戰錘、CX-18"
      : "搜尋店名或商場，例如：板橋・LaLaport・漢神";

  if (state.page === "draws") {
    const list = filteredDraws();
    empty.textContent = state.onlyIncomplete
      ? "目前篩選下沒有未抽完的門市，試試關閉「只看未抽完」或換地區。"
      : "沒有符合的抽選門市，試試其他關鍵字或切換縣市。";
    if (!list.length) {
      listEl.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      listEl.innerHTML = groupedDrawHtml(list);
    }
    renderStatus(list);
    renderListActions(list.length);
    return;
  }

  empty.textContent = "沒有符合的門市，試試其他關鍵字或切換區域。";
  const list = filteredStores();
  const nearestId = state.nearestId;

  if (!list.length) {
    listEl.innerHTML = "";
    empty.hidden = false;
  } else {
    empty.hidden = true;
    listEl.innerHTML = groupedHtml(list, nearestId);
  }

  renderStatus(list);
  renderListActions(0);
}

pageNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  setPage(button.dataset.page);
});

filtersEl.addEventListener("click", (event) => {
  const cityBtn = event.target.closest("[data-city]");
  if (cityBtn) {
    state.city = cityBtn.dataset.city;
    render();
    return;
  }
  const button = event.target.closest("[data-region]");
  if (!button) return;
  state.region = button.dataset.region;
  render();
});

listActionsEl?.addEventListener("click", (event) => {
  const incompleteBtn = event.target.closest("[data-incomplete-toggle]");
  if (incompleteBtn) {
    state.onlyIncomplete = !state.onlyIncomplete;
    render();
    return;
  }
  const button = event.target.closest("[data-fold]");
  if (!button) return;
  setFoldAll(button.dataset.fold === "collapse");
});

listEl.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-draw-toggle]");
  if (toggle) {
    const id = toggle.dataset.drawToggle;
    const card = toggle.closest(".draw-card");
    if (!card) return;
    const willCollapse = !card.classList.contains("is-collapsed");
    card.classList.toggle("is-collapsed", willCollapse);
    toggle.setAttribute("aria-expanded", willCollapse ? "false" : "true");
    if (willCollapse) state.collapsed.add(id);
    else state.collapsed.delete(id);
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...state.collapsed]));
    return;
  }

  const link = event.target.closest("[data-draw-url]");
  if (!link) return;
  const url = link.dataset.drawUrl;
  state.visited.add(url);
  localStorage.setItem(VISITED_KEY, JSON.stringify([...state.visited]));
  link.classList.add("is-visited");
  const label = link.querySelector(".draw-btn-label");
  if (label) label.textContent = "已抽";

  const card = link.closest(".draw-card");
  const summary = card?.querySelector(".draw-card-summary");
  if (card && summary) {
    const total = card.querySelectorAll("[data-draw-url]").length;
    const done = card.querySelectorAll("[data-draw-url].is-visited").length;
    summary.textContent = `已抽 ${done}/${total}${done === total ? " · 已完成" : ""}`;
    if (state.onlyIncomplete && done === total) {
      render();
    }
  }
});

function updateBackTop() {
  if (!backTopBtn) return;
  backTopBtn.classList.toggle("is-visible", window.scrollY > 420);
}

backTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

window.addEventListener("hashchange", () => {
  const next = pageFromHash();
  if (next !== state.page) setPage(next);
});

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    state.geoError = "這個瀏覽器不支援定位，請改用區域篩選。";
    render();
    return;
  }

  if (!window.isSecureContext) {
    state.geoError = "本機用 http 開網站時，手機不允許定位。上線到 GitHub Pages（https）後即可使用；現在可改點上方地區。";
    render();
    return;
  }

  locateBtn.disabled = true;
  locateBtn.textContent = "定位中…";
  statusEl.textContent = "正在取得你的位置…";

  const onSuccess = (position) => {
    state.userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    const ranked = withDistance(stores).sort((a, b) => a.distanceKm - b.distanceKm);
    state.nearestId = ranked[0]?.id ?? null;
    state.geoError = "";
    state.region = "all";
    locateBtn.disabled = false;
    locateBtn.textContent = "已定位 · 再找一次";
    render();
  };

  const failMessage = (error) => {
    if (error?.code === 1) {
      return "定位權限被拒絕。請在手機瀏覽器允許「位置」，或改用地區篩選。";
    }
    if (error?.code === 3) {
      return "定位逾時。請到訊號較好處再試，或改用地區篩選。";
    }
    return "無法取得定位。仍可用上方區域與搜尋找店。";
  };

  const onFail = (error) => {
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (retryError) => {
        state.geoError = failMessage(retryError || error);
        locateBtn.disabled = false;
        locateBtn.textContent = "定位最近門市";
        render();
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  };

  navigator.geolocation.getCurrentPosition(onSuccess, onFail, {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 60000,
  });
});

syncBtn?.addEventListener("click", () => {
  syncRemoteDraws();
});

renderFooter();
renderSyncMeta(localStorage.getItem(SYNC_AT_KEY));
render();
