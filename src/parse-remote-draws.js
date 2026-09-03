/** 從 uxux11 funbox-line 公開頁解析陀螺抽選門市 */

export const REMOTE_DRAWS_URL = "https://uxux11.github.io/funbox-line/";

export const CITY_TO_REGION = {
  台北市: "north",
  新北市: "north",
  桃園市: "tyhcm",
  新竹市: "tyhcm",
  新竹縣: "tyhcm",
  苗栗縣: "tyhcm",
  台中市: "central",
  彰化縣: "central",
  雲林縣: "central",
  嘉義市: "south",
  台南市: "south",
  高雄市: "south",
  屏東縣: "south",
  澎湖縣: "south",
  宜蘭縣: "east",
  花蓮縣: "east",
  台東縣: "east",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function cleanStartTime(raw) {
  return raw.replace(/^抽選(時間|日期|開始)[：:]\s*/, "").trim();
}

/**
 * @param {string} html
 * @returns {{ title: string, draws: Array<{id:string,name:string,city:string,region:string,startTime:string,notes:string[],items:{product:string,url:string}[]}> }}
 */
export function parseRemoteDrawsHtml(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const page = doc.getElementById("page-draws");
  if (!page) {
    throw new Error("遠端頁面找不到抽選區塊（#page-draws）");
  }

  const title = page.querySelector(".draw-main-title")?.textContent?.trim() || "";
  const draws = [];

  page.querySelectorAll(".draw-store").forEach((el, index) => {
    const city = el.getAttribute("data-draw-city")?.trim() || "未分類";
    const name = el.querySelector(".draw-store-name")?.textContent?.trim() || "";
    const startRaw = el.querySelector(".draw-start")?.textContent?.trim() || "";
    const items = [...el.querySelectorAll(".draw-item")]
      .map((item) => {
        const product =
          item.querySelector(".draw-product")?.textContent?.trim() || "抽選連結";
        const href = item.querySelector("a.draw-link")?.getAttribute("href") || "";
        return { product, url: href.trim() };
      })
      .filter((item) => item.url.startsWith("http"));

    if (!name || !items.length) return;

    draws.push({
      id: `draw-${slugify(name) || index}-${index}`,
      name,
      city,
      region: CITY_TO_REGION[city] || "north",
      startTime: cleanStartTime(startRaw),
      notes: [],
      items,
    });
  });

  if (!draws.length) {
    throw new Error("遠端頁面沒有解析到任何抽選門市");
  }

  return { title, draws };
}

/** 把「9/4 9/5抽陀螺」之類標題轉成 event-chip 文字 */
export function titleToEventChip(title) {
  const m = title.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2}).*?(\d{1,2})\s*[\/月]\s*(\d{1,2})/);
  if (m) return `${m[1]}/${m[2]} – ${m[3]}/${m[4]} 抽選進行中`;
  const single = title.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2})/);
  if (single) return `${single[1]}/${single[2]} 抽選進行中`;
  return title ? `${title} · 抽選進行中` : "";
}

export async function fetchRemoteDraws() {
  const url = `${REMOTE_DRAWS_URL}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`遠端回應 ${res.status}`);
  }
  const html = await res.text();
  return parseRemoteDrawsHtml(html);
}
