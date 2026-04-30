"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Window {
  gantryId: string;
  freeway: string;
  direction: string;
  windowStart: string;
  vehicleClass: string;
  count: number;
  avgSpeedKph: number;
}

export default function FreewayEtcDemo({ rows }: DemoProps) {
  const data = useMemo<Window[]>(
    () =>
      rows.map((r) => ({
        gantryId: String(r.gantryId ?? ""),
        freeway: String(r.freeway ?? ""),
        direction: String(r.direction ?? ""),
        windowStart: String(r.windowStart ?? ""),
        vehicleClass: String(r.vehicleClass ?? ""),
        count: Number(r.count),
        avgSpeedKph: Number(r.avgSpeedKph),
      })),
    [rows],
  );

  const gantries = Array.from(new Set(data.map((d) => d.gantryId)));
  const [gantry, setGantry] = useState(gantries[0] ?? "");

  const series = useMemo(
    () =>
      data
        .filter((d) => d.gantryId === gantry && d.vehicleClass === "S")
        .sort((a, b) => a.windowStart.localeCompare(b.windowStart)),
    [data, gantry],
  );

  const minSpeed = series.length > 0 ? Math.min(...series.map((s) => s.avgSpeedKph)) : 0;
  const maxCount = series.length > 0 ? Math.max(...series.map((s) => s.count)) : 1;
  const peak = series.find((s) => s.avgSpeedKph === minSpeed);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">
          <span className="text-xs text-ink-500 mr-2">門架：</span>
          <select
            value={gantry}
            onChange={(e) => setGantry(e.target.value)}
            className="border border-ink-300 rounded px-2 py-1 bg-white text-sm font-mono"
          >
            {gantries.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        {peak ? (
          <div className="text-xs text-ink-500">
            尖峰時段：
            <span className="font-mono text-rose-500 ml-1">
              {peak.windowStart.slice(11, 16)} · {peak.avgSpeedKph} km/h（{peak.count} 車次）
            </span>
          </div>
        ) : null}
      </div>

      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-xs text-ink-500">
            <tr>
              <th className="text-left px-3 py-2 font-mono">window</th>
              <th className="text-right px-3 py-2">車次</th>
              <th className="text-right px-3 py-2">平均車速</th>
              <th className="px-3 py-2">壅塞程度</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {series.map((s) => {
              const slow = (1 - s.avgSpeedKph / 100) * 100;
              return (
                <tr key={s.windowStart}>
                  <td className="px-3 py-1.5 font-mono text-xs text-ink-700">
                    {s.windowStart.slice(11, 16)}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{s.count}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {s.avgSpeedKph.toFixed(1)} km/h
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${slow}%`,
                          backgroundColor:
                            slow > 60 ? "#ef4444" : slow > 40 ? "#f97316" : slow > 20 ? "#eab308" : "#10b981",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {series.length === 0 ? (
          <div className="px-4 py-6 text-sm text-ink-400 text-center">無小客車資料</div>
        ) : null}
      </div>
      <div className="text-[11px] text-ink-400">
        本 demo 僅含小客車（S）資料；最大車次 {maxCount}，最低車速 {minSpeed.toFixed(1)} km/h。資料為示意。
      </div>
    </div>
  );
}
