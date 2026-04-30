"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Spot {
  id: string;
  name: string;
  city: string;
  category: string;
  ticketTwd: number;
  accessible: boolean;
  summary: string;
}

export default function TourismSpotsDemo({ rows }: DemoProps) {
  const data = useMemo<Spot[]>(
    () => rows.map((r) => r as unknown as Spot),
    [rows],
  );
  const cities = Array.from(new Set(data.map((d) => d.city)));
  const cats = Array.from(new Set(data.map((d) => d.category)));

  const [city, setCity] = useState<string>("");
  const [cat, setCat] = useState<string>("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [a11y, setA11y] = useState(false);

  const filtered = useMemo(() => {
    return data.filter(
      (d) =>
        (!city || d.city === city) &&
        (!cat || d.category === cat) &&
        (!freeOnly || d.ticketTwd === 0) &&
        (!a11y || d.accessible),
    );
  }, [data, city, cat, freeOnly, a11y]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-ink-300 rounded px-2 py-1 bg-white text-sm"
        >
          <option value="">所有縣市</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="border border-ink-300 rounded px-2 py-1 bg-white text-sm"
        >
          <option value="">所有類別</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="text-sm flex items-center gap-1.5">
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          只看免費
        </label>
        <label className="text-sm flex items-center gap-1.5">
          <input type="checkbox" checked={a11y} onChange={(e) => setA11y(e.target.checked)} />
          無障礙友善
        </label>
        <span className="ml-auto text-xs text-ink-500">
          找到 <span className="font-mono text-ink-900">{filtered.length}</span> 處
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((s) => (
          <div key={s.id} className="border border-ink-200 rounded-lg bg-white p-4">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h4 className="font-semibold text-ink-900">{s.name}</h4>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-ink-100 text-ink-500 shrink-0">
                {s.category}
              </span>
            </div>
            <div className="text-xs text-ink-500 mb-2">{s.city}</div>
            <p className="text-sm text-ink-600 leading-6 mb-3">{s.summary}</p>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <span className={s.ticketTwd === 0 ? "text-emerald-600 font-semibold" : ""}>
                {s.ticketTwd === 0 ? "免費" : `NT$ ${s.ticketTwd}`}
              </span>
              {s.accessible ? <span title="無障礙">♿</span> : null}
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div className="col-span-full text-sm text-ink-400 py-12 text-center">
            無符合條件的景點。
          </div>
        ) : null}
      </div>
    </div>
  );
}
