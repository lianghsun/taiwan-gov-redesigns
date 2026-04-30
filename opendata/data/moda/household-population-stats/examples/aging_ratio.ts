// 計算各縣市 65+ 人口占比並排序。
//
// 執行：
//   npx tsx aging_ratio.ts
//   或：deno run --allow-read aging_ratio.ts

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

interface Row {
  year: number;
  county: string;
  ageBucket: "0-14" | "15-64" | "65+";
  population: number | null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", "data.json");

const rows: Row[] = JSON.parse(readFileSync(DATA, "utf-8"));
const latestYear = Math.max(...rows.map((r) => r.year));

const byCounty = new Map<string, Map<string, number | null>>();
for (const r of rows.filter((x) => x.year === latestYear)) {
  if (!byCounty.has(r.county)) byCounty.set(r.county, new Map());
  byCounty.get(r.county)!.set(r.ageBucket, r.population);
}

const ratios: { county: string; total: number; aging: number; pct: number }[] = [];
for (const [county, m] of byCounty) {
  const a = m.get("0-14");
  const b = m.get("15-64");
  const c = m.get("65+");
  if (a == null || b == null || c == null) continue;
  const total = a + b + c;
  const pct = (c / total) * 100;
  ratios.push({ county, total, aging: c, pct });
}

ratios.sort((x, y) => y.pct - x.pct);

console.log(`${latestYear} 年各縣市高齡 (65+) 人口比例：`);
for (const r of ratios) {
  console.log(
    `  ${r.county.padEnd(4, "　")}  ${r.pct.toFixed(2)}%  (${r.aging.toLocaleString()} / ${r.total.toLocaleString()})`,
  );
}
