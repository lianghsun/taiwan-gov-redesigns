"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Row {
  year: number;
  county: string;
  ageBucket: string;
  population: number | null;
}

export default function HouseholdPopulationDemo({ rows }: DemoProps) {
  const data = useMemo<Row[]>(() => rows.map((r) => r as unknown as Row), [rows]);
  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a);
  const [year, setYear] = useState(years[0]);

  const ratios = useMemo(() => {
    const byCounty = new Map<string, Map<string, number | null>>();
    for (const r of data.filter((x) => x.year === year)) {
      if (!byCounty.has(r.county)) byCounty.set(r.county, new Map());
      byCounty.get(r.county)!.set(r.ageBucket, r.population);
    }
    const out: { county: string; total: number; aging: number; pct: number }[] = [];
    for (const [c, m] of byCounty) {
      const a = m.get("0-14");
      const b = m.get("15-64");
      const c65 = m.get("65+");
      if (a == null || b == null || c65 == null) continue;
      const total = a + b + c65;
      out.push({ county: c, total, aging: c65, pct: (c65 / total) * 100 });
    }
    return out.sort((a, b) => b.pct - a.pct);
  }, [data, year]);

  const max = Math.max(...ratios.map((r) => r.pct), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-500">年度：</span>
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYear(y)}
            className={
              "px-2.5 py-1 rounded text-sm " +
              (y === year
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-700 hover:border-ink-400")
            }
          >
            {y}
          </button>
        ))}
        <span className="ml-auto text-xs text-ink-500">
          高齡（65+）人口占比，依比例由高至低排序
        </span>
      </div>

      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
        <ul className="divide-y divide-ink-100">
          {ratios.map((r) => {
            const isHigh = r.pct >= 18; // 超高齡社會 / 高齡社會 邊界
            return (
              <li key={r.county} className="px-4 py-2.5">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm text-ink-900 font-medium">{r.county}</span>
                  <span className={`font-mono tabular-nums text-sm ${isHigh ? "text-rose-500" : "text-ink-700"}`}>
                    {r.pct.toFixed(2)}%
                    <span className="ml-2 text-xs text-ink-400">
                      ({r.aging.toLocaleString()} / {r.total.toLocaleString()})
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(r.pct / max) * 100}%`,
                      backgroundColor: isHigh ? "#ef4444" : "#3461d6",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="text-[11px] text-ink-400">
        紅色 ≥ 18%（高齡社會門檻）。本資料為虛構示意，連江縣因 k&lt;5 抑制故缺值。
      </div>
    </div>
  );
}
