"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Period {
  year: number;
  period: string;
  special: string;
  grand: string;
  first: string;
  extra6th: string;
  cloud: string;
}

function matchTier(p: Period, num: string): { tier: string; prize: number } | null {
  if (p.special === num) return { tier: "特別獎", prize: 10_000_000 };
  if (p.grand === num) return { tier: "特獎", prize: 2_000_000 };
  for (const f of p.first.split(",")) {
    if (f === num) return { tier: "頭獎", prize: 200_000 };
    if (num.endsWith(f.slice(-7))) return { tier: "二獎", prize: 40_000 };
    if (num.endsWith(f.slice(-6))) return { tier: "三獎", prize: 10_000 };
    if (num.endsWith(f.slice(-5))) return { tier: "四獎", prize: 4_000 };
    if (num.endsWith(f.slice(-4))) return { tier: "五獎", prize: 1_000 };
    if (num.endsWith(f.slice(-3))) return { tier: "六獎", prize: 200 };
  }
  for (const e of p.extra6th.split(",")) {
    if (num.endsWith(e)) return { tier: "增開六獎", prize: 200 };
  }
  return null;
}

export default function InvoiceCheckerDemo({ rows }: DemoProps) {
  const periods = useMemo(
    () => rows.map((r) => r as unknown as Period).sort((a, b) => (b.year - a.year) || b.period.localeCompare(a.period)),
    [rows],
  );
  const latest = periods[0];
  const [year, setYear] = useState<number>(latest.year);
  const [period, setPeriod] = useState<string>(latest.period);
  const [num, setNum] = useState("");

  const target = useMemo(
    () => periods.find((p) => p.year === year && p.period === period),
    [periods, year, period],
  );
  const result = useMemo(() => {
    if (!target || num.length !== 8 || !/^\d{8}$/.test(num)) return null;
    return matchTier(target, num);
  }, [target, num]);

  const yearOptions = Array.from(new Set(periods.map((p) => p.year))).sort((a, b) => b - a);
  const periodOptions = Array.from(new Set(periods.filter((p) => p.year === year).map((p) => p.period)));

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-4">
      <div className="border border-ink-200 rounded-lg bg-white p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-xs text-ink-500 block mb-1">年度（民國）</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border border-ink-300 rounded px-2 py-1.5 bg-white"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-xs text-ink-500 block mb-1">期別</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-ink-300 rounded px-2 py-1.5 bg-white"
            >
              {periodOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-xs text-ink-500 block mb-1">8 碼發票號碼</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={num}
            onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="例：49502718"
            className="w-full border border-ink-300 rounded px-3 py-2 font-mono tabular-nums tracking-widest text-lg"
          />
        </label>

        <div className="pt-2 border-t border-ink-100">
          {num.length < 8 ? (
            <div className="text-sm text-ink-400">輸入完整 8 碼後即時比對。</div>
          ) : result ? (
            <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded p-4">
              <div className="text-xs uppercase tracking-wider mb-1">恭喜中獎</div>
              <div className="text-lg font-bold">{result.tier}</div>
              <div className="text-sm mt-1">獎金 NT$ {result.prize.toLocaleString()}</div>
            </div>
          ) : (
            <div className="border border-ink-200 bg-ink-50 text-ink-500 rounded p-4 text-sm">
              此期無中獎。
            </div>
          )}
        </div>
        <div className="text-[11px] text-ink-400 leading-5">
          本 demo 之中獎號碼為虛構，請勿用於真實對獎。共 {periods.length} 期樣本。
        </div>
      </div>

      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-2 border-b border-ink-100 text-xs text-ink-500">
          當期中獎號碼（{year} 年 {period} 期）
        </div>
        {target ? (
          <ul className="text-sm divide-y divide-ink-100">
            <li className="px-4 py-2 flex justify-between"><span className="text-ink-500">特別獎</span><code className="font-mono">{target.special}</code></li>
            <li className="px-4 py-2 flex justify-between"><span className="text-ink-500">特獎</span><code className="font-mono">{target.grand}</code></li>
            <li className="px-4 py-2"><span className="text-ink-500">頭獎</span><div className="font-mono mt-1 text-xs">{target.first.split(",").join("、")}</div></li>
            <li className="px-4 py-2"><span className="text-ink-500">增開六獎</span><div className="font-mono mt-1 text-xs">{target.extra6th.split(",").join("、")}</div></li>
            <li className="px-4 py-2"><span className="text-ink-500">雲端發票專屬獎</span><div className="font-mono mt-1 text-xs">{target.cloud?.split(",").join("、")}</div></li>
          </ul>
        ) : (
          <div className="px-4 py-6 text-sm text-ink-400 text-center">查無此期</div>
        )}
      </div>
    </div>
  );
}
