// 對統一發票
//   node check_invoice.mjs 115 01-02 49502718

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", "data.jsonl");

function loadAll() {
  return readFileSync(DATA, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function matchTier(period, num) {
  if (period.special === num) return { tier: "特別獎", prize: 10_000_000 };
  if (period.grand === num) return { tier: "特獎", prize: 2_000_000 };
  for (const f of period.first.split(",")) {
    if (f === num) return { tier: "頭獎", prize: 200_000 };
    if (num.endsWith(f.slice(-7))) return { tier: "二獎", prize: 40_000 };
    if (num.endsWith(f.slice(-6))) return { tier: "三獎", prize: 10_000 };
    if (num.endsWith(f.slice(-5))) return { tier: "四獎", prize: 4_000 };
    if (num.endsWith(f.slice(-4))) return { tier: "五獎", prize: 1_000 };
    if (num.endsWith(f.slice(-3))) return { tier: "六獎", prize: 200 };
  }
  for (const e of period.extra6th.split(",")) {
    if (num.endsWith(e)) return { tier: "增開六獎", prize: 200 };
  }
  return null;
}

const [, , year, p, num] = process.argv;
if (!num) {
  console.error("用法：node check_invoice.mjs <民國年> <期別> <8碼發票號碼>");
  process.exit(1);
}

const all = loadAll();
const period = all.find((w) => String(w.year) === year && w.period === p);
if (!period) {
  console.error(`查無 ${year} 年 ${p} 期資料`);
  process.exit(2);
}

const result = matchTier(period, num);
if (!result) {
  console.log(`發票號碼 ${num}：未中獎`);
} else {
  console.log(`發票號碼 ${num}：恭喜中 ${result.tier}，獎金 NT$${result.prize.toLocaleString()}`);
}
