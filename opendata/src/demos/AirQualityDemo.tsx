"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Hour {
  siteName: string;
  county: string;
  datetime: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#10b981";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  return "#7c2d12";
}

export default function AirQualityDemo({ rows }: DemoProps) {
  const data = useMemo<Hour[]>(
    () =>
      rows.map((r) => ({
        siteName: String(r.siteName ?? ""),
        county: String(r.county ?? ""),
        datetime: String(r.datetime ?? ""),
        aqi: Number(r.aqi),
        pm25: Number(r.pm25),
        pm10: Number(r.pm10),
      })),
    [rows],
  );

  const sites = Array.from(new Set(data.map((d) => d.siteName)));
  const [site, setSite] = useState(sites[0] ?? "");
  const [metric, setMetric] = useState<"aqi" | "pm25" | "pm10">("pm25");

  const series = useMemo(
    () => data.filter((d) => d.siteName === site).sort((a, b) => a.datetime.localeCompare(b.datetime)),
    [data, site],
  );
  const values = series.map((s) => s[metric]);
  const max = Math.max(...values, 1);

  const W = 720;
  const H = 220;
  const PAD = { top: 10, right: 10, bottom: 24, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const points = series.map((s, i) => {
    const x = PAD.left + (innerW * i) / Math.max(1, series.length - 1);
    const y = PAD.top + innerH - (innerH * s[metric]) / max;
    return { x, y, ts: s.datetime, val: s[metric], aqi: s.aqi };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const labelOf = { aqi: "AQI", pm25: "PM2.5 (µg/m³)", pm10: "PM10 (µg/m³)" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">
          <span className="text-xs text-ink-500 mr-2">測站：</span>
          <select
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="border border-ink-300 rounded px-2 py-1 bg-white text-sm"
          >
            {sites.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-1">
          {(["aqi", "pm25", "pm10"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={
                "px-2.5 py-1 rounded text-xs " +
                (m === metric
                  ? "bg-ink-900 text-white"
                  : "bg-white border border-ink-200 text-ink-700 hover:border-ink-400")
              }
            >
              {labelOf[m]}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-ink-500">
          當日範圍：
          <span className="font-mono ml-1.5">
            {Math.min(...values)} – {Math.max(...values)}
          </span>
        </div>
      </div>

      <div className="border border-ink-200 rounded-lg bg-white p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* y-axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + innerH * (1 - t)}
                y2={PAD.top + innerH * (1 - t)}
                stroke="#eceef2"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 4}
                y={PAD.top + innerH * (1 - t) + 3}
                fontSize="10"
                textAnchor="end"
                fill="#a4abbb"
                className="font-mono"
              >
                {Math.round(max * t)}
              </text>
            </g>
          ))}
          {/* hour ticks (every 4hr) */}
          {points.map((p, i) =>
            i % 4 === 0 ? (
              <text
                key={i}
                x={p.x}
                y={H - 6}
                fontSize="9"
                textAnchor="middle"
                fill="#a4abbb"
                className="font-mono"
              >
                {p.ts.slice(11, 13)}
              </text>
            ) : null,
          )}
          <path d={path} fill="none" stroke="#3461d6" strokeWidth="2" />
          {points.map((p) => (
            <circle key={p.ts} cx={p.x} cy={p.y} r="3" fill={metric === "aqi" ? aqiColor(p.aqi) : "#3461d6"}>
              <title>{`${p.ts.slice(11, 16)} · ${labelOf[metric]} = ${p.val}`}</title>
            </circle>
          ))}
        </svg>
        <div className="text-[11px] text-ink-400 mt-1 text-right">
          資料：{labelOf[metric]} · {series[0]?.datetime.slice(0, 10)}
        </div>
      </div>
    </div>
  );
}
