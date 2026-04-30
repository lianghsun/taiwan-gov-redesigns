import { loadStructured, loadText } from "./loaders.js";

interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371.0088;
  const p1 = (aLat * Math.PI) / 180;
  const p2 = (bLat * Math.PI) / 180;
  const dp = ((bLat - aLat) * Math.PI) / 180;
  const dl = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const GRADE_RANK: Record<string, number> = {
  特優: 0,
  優等: 1,
  良好: 2,
  普通: 3,
  改善: 4,
};

export const TOOLS: ToolDef[] = [
  {
    name: "find_holiday",
    description: "查詢中華民國 115 年（2026）某日是否為政府機關放假日，回傳該日資訊（含補假/紀念日/補行上班）。",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "日期 ISO 8601 (YYYY-MM-DD)" },
      },
      required: ["date"],
    },
    handler: ({ date }) => {
      const rows = loadStructured("gov-calendar-2026") as Array<{
        date: string;
        weekday: string;
        isHoliday: boolean;
        description: string;
      }>;
      const found = rows.find((r) => r.date === date);
      if (!found) return { date, found: false, note: "本 demo 僅收錄 30 筆精選日期。" };
      return found;
    },
  },
  {
    name: "nearest_toilets",
    description: "輸入經緯度，找指定半徑內的公廁，依評等與距離排序。",
    inputSchema: {
      type: "object",
      properties: {
        lat: { type: "number" },
        lng: { type: "number" },
        radius_km: { type: "number", default: 1.0 },
        limit: { type: "integer", default: 10 },
      },
      required: ["lat", "lng"],
    },
    handler: ({ lat, lng, radius_km = 1.0, limit = 10 }) => {
      const rows = loadStructured("public-toilets") as Array<{
        id: string;
        name: string;
        address: string;
        city: string;
        lat: string;
        lng: string;
        grade: string;
        accessible: string;
        diaperStation: string;
      }>;
      const out = rows
        .map((r) => ({
          ...r,
          lat: Number(r.lat),
          lng: Number(r.lng),
          accessible: r.accessible === "true",
          diaperStation: r.diaperStation === "true",
          distance_km: haversineKm(lat as number, lng as number, Number(r.lat), Number(r.lng)),
        }))
        .filter((r) => r.distance_km <= (radius_km as number))
        .sort((a, b) => {
          const ar = GRADE_RANK[a.grade] ?? 9;
          const br = GRADE_RANK[b.grade] ?? 9;
          if (ar !== br) return ar - br;
          return a.distance_km - b.distance_km;
        })
        .slice(0, limit as number);
      return { count: out.length, results: out };
    },
  },
  {
    name: "check_invoice",
    description: "對統一發票：輸入民國年、期別（YY-MM 雙月）與 8 碼發票號碼，回傳中獎結果（demo 為虛構號碼）。",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "integer", description: "民國年 (例 115)" },
        period: { type: "string", description: "期別 (例 01-02)" },
        number: { type: "string", description: "8 碼發票號碼" },
      },
      required: ["year", "period", "number"],
    },
    handler: ({ year, period, number }) => {
      const rows = loadStructured("uniform-invoice-winners") as Array<{
        year: number;
        period: string;
        special: string;
        grand: string;
        first: string;
        extra6th: string;
      }>;
      const w = rows.find((r) => r.year === year && r.period === period);
      if (!w) return { matched: false, note: `查無 ${year} 年 ${period} 期資料。` };
      const num = String(number);
      if (w.special === num) return { matched: true, tier: "特別獎", prize: 10_000_000 };
      if (w.grand === num) return { matched: true, tier: "特獎", prize: 2_000_000 };
      const firsts = w.first.split(",");
      for (const f of firsts) {
        if (f === num) return { matched: true, tier: "頭獎", prize: 200_000 };
        if (num.endsWith(f.slice(-7))) return { matched: true, tier: "二獎", prize: 40_000 };
        if (num.endsWith(f.slice(-6))) return { matched: true, tier: "三獎", prize: 10_000 };
        if (num.endsWith(f.slice(-5))) return { matched: true, tier: "四獎", prize: 4_000 };
        if (num.endsWith(f.slice(-4))) return { matched: true, tier: "五獎", prize: 1_000 };
        if (num.endsWith(f.slice(-3))) return { matched: true, tier: "六獎", prize: 200 };
      }
      for (const e of w.extra6th.split(",")) {
        if (num.endsWith(e)) return { matched: true, tier: "增開六獎", prize: 200 };
      }
      return { matched: false, tier: "未中獎" };
    },
  },
  {
    name: "aqi_at",
    description: "查詢空氣品質測站某時段資料（小時值）。可指定測站名（中山/板橋/桃園/沙鹿/左營）與日期。",
    inputSchema: {
      type: "object",
      properties: {
        siteName: { type: "string" },
        date: { type: "string", description: "ISO 8601 日期 YYYY-MM-DD" },
      },
      required: ["siteName"],
    },
    handler: ({ siteName, date }) => {
      const rows = loadStructured("air-quality-hourly") as Array<{
        siteId: string;
        siteName: string;
        county: string;
        datetime: string;
        aqi: string;
        pm25: string;
        pm10: string;
      }>;
      let filtered = rows.filter((r) => r.siteName === siteName);
      if (date) filtered = filtered.filter((r) => r.datetime.startsWith(date as string));
      if (filtered.length === 0) return { count: 0, note: "無資料" };
      const numericRows = filtered.map((r) => ({
        ...r,
        aqi: Number(r.aqi),
        pm25: Number(r.pm25),
        pm10: Number(r.pm10),
      }));
      const aqis = numericRows.map((r) => r.aqi);
      return {
        count: numericRows.length,
        rows: numericRows,
        summary: {
          aqi_min: Math.min(...aqis),
          aqi_max: Math.max(...aqis),
          aqi_avg: Math.round(aqis.reduce((s, x) => s + x, 0) / aqis.length),
        },
      };
    },
  },
  {
    name: "search_tourism_spots",
    description: "篩選觀光遊憩據點。可依縣市、類別、是否免費、是否無障礙過濾。",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "縣市，例 花蓮縣" },
        category: { type: "string", description: "類別：自然/文化/古蹟/主題園區/步道/夜市/海岸/溫泉" },
        free_only: { type: "boolean", description: "只顯示免門票景點" },
        accessible_only: { type: "boolean" },
        limit: { type: "integer", default: 20 },
      },
    },
    handler: ({ city, category, free_only, accessible_only, limit = 20 }) => {
      let rows = loadStructured("tourism-spots") as Array<{
        id: string;
        name: string;
        city: string;
        category: string;
        ticketTwd: number;
        accessible: boolean;
        summary: string;
      }>;
      if (city) rows = rows.filter((r) => r.city === city);
      if (category) rows = rows.filter((r) => r.category === category);
      if (free_only) rows = rows.filter((r) => r.ticketTwd === 0);
      if (accessible_only) rows = rows.filter((r) => r.accessible);
      rows = rows.slice(0, limit as number);
      return { count: rows.length, results: rows };
    },
  },
  {
    name: "search_legal_articles",
    description: "在法規條文中搜尋關鍵字，回傳相符條文 chunk（含法律名稱與條號）。",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string" },
        limit: { type: "integer", default: 10 },
      },
      required: ["keyword"],
    },
    handler: ({ keyword, limit = 10 }) => {
      const files = loadText("legal-texts-sample");
      const out: { law: string; article: number; source: string; text: string }[] = [];
      const articleRe = /^第\s*(\d+)\s*條(?:[^\n]*)$/gm;
      for (const f of files) {
        if (!/\.txt$/.test(f.path)) continue;
        const text = f.content;
        const matches = [...text.matchAll(articleRe)];
        if (matches.length === 0) continue;
        const head = text.slice(0, matches[0].index).trim();
        const law = head.split(/\r?\n/)[0] || f.path;
        for (let i = 0; i < matches.length; i++) {
          const m = matches[i];
          const start = m.index!;
          const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
          const body = text.slice(start, end).trim();
          if (body.includes(keyword as string)) {
            out.push({ law, article: Number(m[1]), source: f.path, text: body });
          }
        }
      }
      return { count: out.length, results: out.slice(0, limit as number) };
    },
  },
  {
    name: "query_population",
    description: "查詢戶役政人口結構統計（年/縣市/年齡層）。可指定年度與縣市。",
    inputSchema: {
      type: "object",
      properties: {
        year: { type: "integer" },
        county: { type: "string" },
      },
    },
    handler: ({ year, county }) => {
      let rows = loadStructured("household-population-stats") as Array<{
        year: number;
        county: string;
        ageBucket: string;
        population: number | null;
      }>;
      if (year) rows = rows.filter((r) => r.year === year);
      if (county) rows = rows.filter((r) => r.county === county);
      return { count: rows.length, results: rows, note: "fabricated 示意資料" };
    },
  },
  {
    name: "decisions_in_meeting",
    description: "抓出指定院會的決議事項。可用日期 (YYYY-MM-DD) 或會次號 (3792 / 3791 / 3790)。",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string" },
        meeting_no: { type: "integer" },
      },
    },
    handler: ({ date, meeting_no }) => {
      const files = loadText("cabinet-meeting-minutes-sample");
      let target = files.find((f) => f.path.endsWith("README.md") ? false : true);
      if (date) target = files.find((f) => f.path.startsWith(`${date}-`));
      if (meeting_no) target = files.find((f) => f.path.includes(`-${meeting_no}.md`));
      if (!target) return { count: 0, note: "查無此會議" };
      const lines = target.content.split(/\r?\n/);
      const out: string[] = [];
      let capturing = false;
      for (const l of lines) {
        const s = l.trim();
        if (s.startsWith("決議")) {
          capturing = true;
          continue;
        }
        if (!capturing) continue;
        if (s.startsWith("- ")) out.push(s.slice(2).trim());
        else if (s === "") continue;
        else if (s.startsWith("##") || s.startsWith("#")) capturing = false;
      }
      return { source: target.path, count: out.length, decisions: out };
    },
  },
];
