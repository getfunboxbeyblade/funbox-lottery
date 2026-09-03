/**
 * 門市 ↔ LINE VOOM（記事本）對照表
 * 範圍：雙北 + 桃竹苗 + 中部（台中／彰化／雲林）
 *
 * status:
 * - known     已確認穩定的 /user/_d... 網址，可掃貼文
 * - skip      有網址但不掃 VOOM（例如改只發 FB）
 * - invalid   網址不是公開個人頁，需重抓
 * - missing   尚缺
 *
 * 跟 AI 說「掃雙北／桃竹苗／中部 VOOM」即可依 known 項目抓貼文。
 */

function cleanVoomUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("linevoom.line.me")) return url.split("?")[0];
    if (u.pathname.startsWith("/user/_d")) {
      return `${u.origin}${u.pathname}`;
    }
    return url.split("?")[0];
  } catch {
    return url;
  }
}

export const voomProfiles = [
  // ——— 雙北：台北市 ———
  {
    storeId: "nanxi-skm",
    name: "三越南西",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dXRCeNI62-wxECClrgjwMfi8HnY2ow5Onw6aC1A"
    ),
    status: "known",
  },
  {
    storeId: "station-skm",
    name: "三越站前",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dTQ_Ar8kG3TZeWoB_i2PtLW_TclZiMtldppUzAQ"
    ),
    status: "known",
  },
  {
    storeId: "tianmu-skm",
    name: "天母三越",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dXYFKzVX-ldfgeUOor_McfFTE_yJP7d54nPjxpQ"
    ),
    status: "known",
  },
  {
    storeId: "tianmu-sogo",
    name: "天母SOGO",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_db3MM1gifrvefmBbBLPWOhPAw0aPUL9K3IvLDTk"
    ),
    status: "known",
  },
  {
    storeId: "taipei-underground",
    name: "來玩聚北車地下街",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dXjo38IGuVk3obdbWWB8DVc86lCei15_6UkRuW8"
    ),
    status: "known",
    notes: "使用者標註「來玩具北車地下街」",
  },
  {
    storeId: "zhongxiao-sogo",
    name: "忠孝SOGO",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dZR3EbkBX6ugUrxVH_Qo47n8xYDp-95FYmhlIWM"
    ),
    status: "known",
  },
  {
    storeId: "xinyi-a8",
    name: "信義A8",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dfItqTWWpJgcZPNYg_b3_xlBeXDhlwTDTicnfSU"
    ),
    status: "known",
  },
  {
    storeId: "nangang-lalaport",
    name: "南港LaLaport",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dVgaAWKsM1ofi6bVa7iJV1_zOspCOrdSv0vgXKw"
    ),
    status: "known",
  },
  {
    storeId: "miramar",
    name: "美麗華",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dS6PecGuAayr8FMQ6NoCcETN1oXZ0zgwun4Uivc"
    ),
    status: "known",
    notes: "先前曾誤標為天母；已更正為美麗華",
  },
  {
    storeId: "takashimaya",
    name: "高島屋",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dfhvm3-8_klezJkCHLv3-mEhPQWOR9DGFr40SPA"
    ),
    status: "known",
  },
  {
    storeId: "xinyi-a13",
    name: "遠百信義A13",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dZWTe6za3_22gXVkl46uAq37zC6nwkQQCwZnBoA"
    ),
    status: "known",
  },
  {
    storeId: "nangang-station",
    name: "南港潤泰",
    city: "台北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dSeRV-7dSwPAS21zhFTEZS9TU0cjb1gBLwEML9A"
    ),
    status: "known",
  },

  // ——— 雙北：新北市 ———
  {
    storeId: "zhonghe-global",
    name: "中和環球",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dSg6slLn5Zg47l9CPlGC-LezlX4EP3fmltKvQRs"
    ),
    status: "known",
  },
  {
    storeId: "breeze-plaza",
    name: "比漾廣場",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dQbxr4jKpXDT3BtXULflBCgU9GujoUvNaAUOOZo"
    ),
    status: "known",
  },
  {
    storeId: "xike-farglory",
    name: "汐止遠雄",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dXWlFT8AyCrEdtsk_fRRUYuqERc8rWDzx3c6DUA"
    ),
    status: "known",
  },
  {
    storeId: "honhui",
    name: "宏匯廣場",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dVPYhYlVfHYMMObafMonYQZCCX0kcQ56HqtZmHo"
    ),
    status: "known",
  },
  {
    storeId: "banqiao-mega",
    name: "板橋大遠百",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dblyPGfsKpebVOKvBaP8gs72hysvg-G0EVYLyv4"
    ),
    status: "known",
  },
  {
    storeId: "banqiao-feds",
    name: "板橋遠東",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dUcATZnmDAam7Low6HB0-JXZC1DzUJEbh8hA8Gg"
    ),
    status: "known",
  },
  {
    storeId: "tamsui-lai",
    name: "淡水禮萊廣場",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dU6uuJLZc-sttPrdL6hfb8pOoMDCcgdNWEtYPKA"
    ),
    status: "known",
  },
  {
    storeId: "xindian-yulon",
    name: "新店誠品／裕隆城",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dWQGqQnQTk4Tc7wJjzrBXKS145vBC93TlHkNG5E"
    ),
    status: "known",
  },
  {
    storeId: "shulin-showtime",
    name: "樹林秀泰",
    city: "新北市",
    area: "雙北",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dSj7fhnsKdDEm1q2ehrYEJTOyrm4OuI2NFsN3I0"
    ),
    status: "known",
  },

  // ——— 桃竹苗 ———
  {
    storeId: "zhongli-taijiang",
    name: "中壢大江",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_daOwg6Nz08TwGFzWoVR264J1CWj5Lp8g0Lgf-QM"
    ),
    status: "known",
  },
  {
    storeId: "zhongli-sogo",
    name: "中壢SOGO",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dcSEo3ibPOyoQAAsta4srlSCIdiLnKQqsbk8mog"
    ),
    status: "known",
  },
  {
    storeId: "taimall",
    name: "桃園台茂",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dZrp8IBATlHOFZaobLCYRrXE5m7abD4dD2ItWm8"
    ),
    status: "known",
  },
  {
    storeId: "zhubei-feds",
    name: "竹北遠東",
    city: "新竹縣",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_deu1wnG4xXho1I98-nH_PZKQ0gl-iAoehGDIHxA"
    ),
    status: "known",
  },
  {
    storeId: "miaoli-shangshun",
    name: "苗栗尚順",
    city: "苗栗縣",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dVHyXrJlEjwLilMjmYrRy8BYKPofyQgAgsWd8Xk"
    ),
    status: "known",
  },
  {
    storeId: "taoyuan-station",
    name: "桃園站前三越",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dQTwDiZdgoMiaxHmu-STwWJF69wlpmOwL0IjMoY"
    ),
    status: "known",
  },
  {
    storeId: "taoyuan-feds",
    name: "桃園遠東",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dZCpDMgUi2_f6JEnQze2nP22nJV-G1o8rHLmpFE"
    ),
    status: "known",
  },
  {
    storeId: "taoyuan-a19",
    name: "桃園環球A19",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dQguBN50HV7T3jjTaZbJKVwoET6cJJH2Kj43Y2E"
    ),
    status: "known",
  },
  {
    storeId: "taoyuan-a8",
    name: "桃園環球A8",
    city: "桃園市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dWWqORTPgThK__JAqyRDK9PX4ReZqnOFc28vpaE"
    ),
    status: "known",
  },
  {
    storeId: "hsinchu-bigcity",
    name: "新竹巨城",
    city: "新竹市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dSYAGjN3DhBtiB8tU2pa3kl5yoRdBG7ucZNUZvo"
    ),
    status: "skip",
    notes: "VOOM 不再更新，抽選資訊改看 FB；掃 VOOM 時略過",
  },
  {
    storeId: "hsinchu-park",
    name: "新竹享平方",
    city: "新竹縣",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dfuDiJPQBJn4ih1iarevDIEIB9XvR-_q44VI6bE"
    ),
    status: "known",
  },
  {
    storeId: "hsinchu-feds",
    name: "新竹遠東",
    city: "新竹市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dYjgWm0vwMyoPEcmLUOBhOQ55A0WaB7EuLfW5Mw"
    ),
    status: "known",
  },
  {
    storeId: "hsinchu-nanya",
    name: "新竹遠雄湳雅",
    city: "新竹市",
    area: "桃竹苗",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dYdtj10kF6eWUWfcb0xr0dYExX6yYVDk1EksNTU"
    ),
    status: "known",
  },

  // ——— 中部：台中市 ———
  {
    storeId: "wenxin-showtime",
    name: "文心秀泰",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dVbUMDyduUeLgyWJWRb0k8o55Sa-xzXFMnCJxpE"
    ),
    status: "known",
  },
  {
    storeId: "taichung-skm",
    name: "台中三越",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dcavY93jrqjYaLVO8JR44m7jxZNARF__lfYuyIo"
    ),
    status: "known",
  },
  {
    storeId: "taichung-chungyo",
    name: "台中中友",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dVExgXo7x7ugfZBDIYzfRF8XR9geWiZncXXAkNM"
    ),
    status: "known",
  },
  {
    storeId: "taichung-port-mitsui",
    name: "台中港三井",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dXDniXt3Xu0U5lkXYliBBHGQRD2FtCUnVVbXPhY"
    ),
    status: "known",
  },
  {
    storeId: "taichung-newera",
    name: "台中新時代／遠雄",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_da-4j4bX8VxHQN54is9WglGxqo3ISQzKaJK2vA0"
    ),
    status: "known",
    notes: "台中新時代購物中心＝台中遠雄店，同一 VOOM",
  },
  {
    storeId: "taichung-hanshin",
    name: "台中漢神洲際",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dSt9xf69BIAHSFiGJ6Li704M4i5NsRW3sYnhIhI"
    ),
    status: "known",
  },
  {
    storeId: "taichung-feds",
    name: "台中大遠百",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_ddG1EBaa4iGasgQdKDdnXo50Y24dW74VXnJuAro"
    ),
    status: "known",
  },
  {
    storeId: "taichung-lalaport",
    name: "台中Lalaport",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dWbmVBOBVpcGPA3UWP953LsGWVx32VkrDcGrqRQ"
    ),
    status: "known",
  },
  {
    storeId: "kuangsan-sogo",
    name: "廣三SOGO",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dUpKOzSR_s9Wca-q8vJLgOSM-UGMJNMonlEK_Nw"
    ),
    status: "known",
  },
  {
    storeId: "fengyuan-pacific",
    name: "豐原太平洋",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dWUEiTQIz0C550q-X-t3o65-r0CLa8-fBL6b6u8"
    ),
    status: "known",
  },
  {
    storeId: "lihpao",
    name: "麗寶一期",
    city: "台中市",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dZD8OLWoBDH7CMfvg3nqfJoIb3wQMGpZ_V7DOOI"
    ),
    status: "known",
  },

  // ——— 中部：彰化／雲林（來玩聚） ———
  {
    storeId: "laiwanju-changhua",
    name: "來玩聚彰化",
    city: "彰化縣",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_deL1i2Bb8uUCbeQ10yCnEvVLz_iZbXwvFtNNTRM"
    ),
    status: "known",
  },
  {
    storeId: "laiwanju-yuanlin",
    name: "來玩聚員林",
    city: "彰化縣",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_dar-0z1aYQPkB0W-BiwgwDp6XsDKAdehbmupEaI"
    ),
    status: "known",
  },
  {
    storeId: "laiwanju-douliu",
    name: "來玩聚斗六",
    city: "雲林縣",
    area: "中部",
    voomUrl: cleanVoomUrl(
      "https://linevoom.line.me/user/_ddu256ZXwJCBqOeIfKwY6QYdeIvbrVOmBRIOKfo"
    ),
    status: "known",
  },

];

export function voomByArea(area) {
  return voomProfiles.filter((row) => row.area === area);
}

export function knownVoomProfiles(area) {
  return voomProfiles.filter(
    (row) => row.status === "known" && row.voomUrl && (!area || row.area === area)
  );
}

export function missingVoomProfiles(area) {
  return voomProfiles.filter(
    (row) => row.status !== "known" && (!area || row.area === area)
  );
}
