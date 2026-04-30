"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Encounter {
  ageBucket: string;
  gender: string;
  department: string;
  icd10Chapter: string;
  feeBucket: string;
}

const QUERIES: { key: string; label: string; group: (r: Encounter) => string }[] = [
  { key: "department", label: "依科別計人次", group: (r) => r.department },
  { key: "ageBucket", label: "依年齡層計人次", group: (r) => r.ageBucket },
  { key: "icd10Chapter", label: "依 ICD-10 章節計人次", group: (r) => r.icd10Chapter },
  { key: "feeBucket", label: "依費用區間計人次", group: (r) => r.feeBucket },
];

/**
 * 抽樣 Laplace(0, 1/ε) 雜訊。
 * 對 counting query 的 sensitivity = 1，所以 scale = 1/ε。
 * 用 inverse CDF：U ~ U(-0.5, 0.5)；x = -scale * sign(U) * ln(1 - 2|U|)
 */
function laplace(epsilon: number, rng: () => number = Math.random): number {
  const u = rng() - 0.5;
  const scale = 1 / epsilon;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function seededRng(seed: number) {
  // mulberry32
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function DpEpsilonDemo({ rows }: DemoProps) {
  const data = useMemo(() => rows.map((r) => r as unknown as Encounter), [rows]);
  const [queryIdx, setQueryIdx] = useState(0);
  const [epsilon, setEpsilon] = useState(1.0);
  const [seed, setSeed] = useState(42);

  const query = QUERIES[queryIdx];

  const buckets = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data) {
      const k = query.group(r);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([k, v]) => ({ key: k, exact: v }))
      .sort((a, b) => b.exact - a.exact);
  }, [data, query]);

  const noisy = useMemo(() => {
    const rng = seededRng(seed);
    return buckets.map((b) => {
      const n = b.exact + laplace(epsilon, rng);
      return { ...b, noisy: Math.max(0, Math.round(n)) };
    });
  }, [buckets, epsilon, seed]);

  const totalExact = buckets.reduce((s, b) => s + b.exact, 0);
  const totalNoisy = noisy.reduce((s, b) => s + b.noisy, 0);
  const maxBar = Math.max(1, ...noisy.map((b) => Math.max(b.exact, b.noisy)));
  const interpretation = (() => {
    if (epsilon >= 3) return { tone: "rose", label: "弱保護", note: "雜訊極小，幾乎可推回個案。一般不建議。" };
    if (epsilon >= 1) return { tone: "amber", label: "中等保護", note: "MoDA 主權資料典型設定（ε ≈ 1）。" };
    if (epsilon >= 0.3) return { tone: "emerald", label: "強保護", note: "雜訊明顯，但統計趨勢仍可辨。" };
    return { tone: "sovereign", label: "極強保護", note: "雜訊大到統計可能失準，僅適用極敏感查詢。" };
  })();
  const toneClass: Record<string, string> = {
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    amber: "bg-accent-50 border-accent-100 text-accent-600",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    sovereign: "bg-sovereign-50 border-sovereign-100 text-sovereign-600",
  };

  return (
    <div className="grid lg:grid-cols-[20rem_1fr] gap-4">
      <div className="space-y-4">
        <div className="border border-ink-200 rounded-lg bg-white p-4">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">查詢</label>
          <div className="flex flex-col gap-1">
            {QUERIES.map((q, i) => (
              <label
                key={q.key}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer ${
                  i === queryIdx ? "bg-sovereign-50 text-sovereign-600 font-semibold" : "hover:bg-ink-50"
                }`}
              >
                <input
                  type="radio"
                  name="dp-query"
                  checked={i === queryIdx}
                  onChange={() => setQueryIdx(i)}
                />
                {q.label}
              </label>
            ))}
          </div>
        </div>

        <div className="border border-ink-200 rounded-lg bg-white p-4">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            隱私預算 ε ＝ {epsilon.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.05}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-mono tabular-nums">
            <span>0.1 強</span>
            <span>1.0</span>
            <span>5.0 弱</span>
          </div>
          <div className={`mt-3 px-3 py-2 rounded border text-xs leading-5 ${toneClass[interpretation.tone]}`}>
            <span className="font-semibold">{interpretation.label}</span>
            <span className="ml-2">{interpretation.note}</span>
          </div>
        </div>

        <div className="border border-ink-200 rounded-lg bg-white p-4 text-xs text-ink-500 leading-6">
          <div className="font-semibold text-ink-700 mb-1">公式</div>
          <code className="font-mono">noisy = exact + Laplace(0, 1/ε)</code>
          <div className="mt-2">
            counting query 的 sensitivity = 1，因此 Laplace scale = 1/ε。ε 越小、雜訊越大、隱私越強。
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="mt-3 text-xs text-sovereign-500 hover:underline"
          >
            重新抽樣（換 seed）
          </button>
        </div>
      </div>

      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-200 bg-ink-50 text-xs text-ink-500 flex items-center justify-between">
          <span>
            原始合計 <span className="font-mono text-ink-700">{totalExact}</span> 人次　·
            加噪合計 <span className="font-mono text-ink-700">{totalNoisy}</span>
          </span>
          <span className="font-mono text-ink-400">{noisy.length} 個 bucket</span>
        </div>
        <ul className="divide-y divide-ink-100 max-h-[28rem] overflow-y-auto">
          {noisy.map((b) => {
            const exactPct = (b.exact / maxBar) * 100;
            const noisyPct = (b.noisy / maxBar) * 100;
            const diff = b.noisy - b.exact;
            return (
              <li key={b.key} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-sm text-ink-900 truncate flex-1">{b.key}</span>
                  <span className="text-xs text-ink-500 font-mono tabular-nums shrink-0">
                    原始 {b.exact} → 加噪 {b.noisy}{" "}
                    <span className={diff >= 0 ? "text-emerald-600" : "text-rose-500"}>
                      ({diff >= 0 ? "+" : ""}
                      {diff})
                    </span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-ink-500" style={{ width: `${exactPct}%` }} />
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sovereign-500" style={{ width: `${noisyPct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="px-4 py-2 text-[11px] text-ink-400 border-t border-ink-100 flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-ink-500 inline-block" /> 原始計數
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-sovereign-500 inline-block" /> 加噪計數
          </span>
        </div>
      </div>
    </div>
  );
}
