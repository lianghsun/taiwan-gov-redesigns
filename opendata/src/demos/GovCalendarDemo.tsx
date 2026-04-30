"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface CalRow {
  date: string;
  weekday: string;
  isHoliday: boolean;
  description: string;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function GovCalendarDemo({ rows }: DemoProps) {
  const map = useMemo(() => {
    const m = new Map<string, CalRow>();
    for (const r of rows) {
      const row = r as unknown as CalRow;
      m.set(row.date, row);
    }
    return m;
  }, [rows]);

  const [month, setMonth] = useState(2); // 二月（含春節）

  const cells: { date: Date; row?: CalRow }[] = [];
  const firstOfMonth = new Date(2026, month - 1, 1);
  const startWd = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(2026, month, 0).getDate();
  for (let i = 0; i < startWd; i++) {
    const d = new Date(firstOfMonth);
    d.setDate(d.getDate() - (startWd - i));
    cells.push({ date: d });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(2026, month - 1, i);
    cells.push({ date: d, row: map.get(ymd(d)) });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonth(m)}
              className={
                "px-2.5 py-1 rounded text-sm transition " +
                (m === month
                  ? "bg-ink-900 text-white"
                  : "text-ink-700 hover:bg-ink-100")
              }
            >
              {m} 月
            </button>
          ))}
        </div>
        <div className="text-xs text-ink-500">2026（民國 115）</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["日", "一", "二", "三", "四", "五", "六"].map((w) => (
          <div key={w} className="text-xs text-ink-400 font-semibold py-1">
            {w}
          </div>
        ))}
        {cells.map((c, i) => {
          const inMonth = c.date.getMonth() === month - 1;
          const isHoliday = c.row?.isHoliday;
          const isExtraWork = !c.row?.isHoliday && c.row?.description?.includes("補行上班");
          const isWeekend = c.date.getDay() === 0 || c.date.getDay() === 6;
          const dim = !inMonth;
          let cls = "py-2.5 text-sm rounded border ";
          if (dim) cls += "border-transparent text-ink-300";
          else if (isHoliday) cls += "bg-rose-50 border-rose-200 text-rose-700 font-semibold";
          else if (isExtraWork) cls += "bg-accent-50 border-accent-100 text-accent-600 font-semibold";
          else if (isWeekend) cls += "bg-ink-100 border-ink-200 text-ink-500";
          else cls += "bg-white border-ink-200 text-ink-700";
          return (
            <div
              key={i}
              className={cls}
              title={c.row?.description ?? (inMonth ? "" : undefined)}
            >
              {c.date.getDate()}
              {c.row?.description ? (
                <div className="text-[10px] mt-0.5 truncate px-1">{c.row.description}</div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-rose-100 border border-rose-200" /> 放假日
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-accent-50 border border-accent-100" /> 補行上班
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-ink-100 border border-ink-200" /> 週六/日
        </span>
        <span className="ml-auto text-[11px] text-ink-400">
          本 demo 僅標示樣本中收錄的 30 筆日期，未列者可能僅是一般週末。
        </span>
      </div>
    </div>
  );
}
