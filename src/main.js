import "./style.css";
import { REGIONS, stores } from "./stores.js";
import { DRAW_CITIES, draws } from "./draws.js";

const listEl = document.getElementById("store-list");
const empty = document.getElementById("empty");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search");
const locateBtn = document.getElementById("locate-btn");
const filtersEl = document.getElementById("region-filters");
const pageNav = document.getElementById("page-nav");
const VISITED_KEY = "visited_draw_urls";

function pageFromHash() {
  return location.hash === "#stores" ? "stores" : "draws";
}

const state = {
  page: pageFromHash(),
  region: "all",
  city: "all",
  query: "",
  userLocation: null,
  nearestId: null,
  geoError: "",
  visited: new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || "[]")),
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
  const q = encodeURIComponent(`Funbox ${store.mall} ${store.city}`);
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
      ...DRAW_CITIES.map((city) => ({
        id: city,
        label: city,
        count: draws.filter((store) => store.city === city).length,
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
        <a class="action-btn secondary-btn" href="${store.facebook}" target="_blank" rel="noopener noreferrer">${iconOut} 粉專</a>
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
    statusEl.textContent = `共 ${list.length} 家有陀螺抽選的門市 · ${list.reduce((n, store) => n + store.items.length, 0)} 個抽獎連結`;
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

function filteredDraws() {
  const query = state.query.trim().toLowerCase();
  let list = draws.slice();

  if (state.city !== "all") {
    list = list.filter((store) => store.city === state.city);
  }

  if (query) {
    list = list.filter((store) => {
      const haystack = `${store.name} ${store.city} ${store.items.map((item) => item.product).join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  return list;
}

function drawCardHtml(store) {
  const notes = store.notes.map((note) => `<p class="draw-note">${note}</p>`).join("");
  const items = store.items
    .map((item) => {
      const visited = state.visited.has(item.url) ? " is-visited" : "";
      return `
        <div class="draw-item">
          <span class="draw-product">${item.product}</span>
          <a class="action-btn line-btn draw-btn${visited}" href="${item.url}" target="_blank" rel="noopener noreferrer" data-draw-url="${item.url}">抽獎</a>
        </div>
      `;
    })
    .join("");

  return `
    <article class="draw-card">
      <h3 class="store-name">${store.name}</h3>
      <p class="draw-meta">${store.city} · 開始 ${store.startTime}</p>
      ${notes}
      <div class="draw-items">${items}</div>
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
  const hash = page === "stores" ? "#stores" : "#draws";
  if (location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
  render();
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
    empty.textContent = "沒有符合的抽選門市，試試其他關鍵字或切換縣市。";
    if (!list.length) {
      listEl.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      listEl.innerHTML = groupedDrawHtml(list);
    }
    renderStatus(list);
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

listEl.addEventListener("click", (event) => {
  const link = event.target.closest("[data-draw-url]");
  if (!link) return;
  const url = link.dataset.drawUrl;
  state.visited.add(url);
  localStorage.setItem(VISITED_KEY, JSON.stringify([...state.visited]));
  link.classList.add("is-visited");
});

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

render();
