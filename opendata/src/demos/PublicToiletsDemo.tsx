"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { DemoProps } from "./registry";

interface Toilet {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  grade: string;
  accessible: boolean;
  diaperStation: boolean;
}

const GRADE_RANK: Record<string, number> = {
  特優: 0,
  優等: 1,
  良好: 2,
  普通: 3,
  改善: 4,
};

const GRADE_COLOR: Record<string, string> = {
  特優: "#10b981",
  優等: "#3b82f6",
  良好: "#f59e0b",
  普通: "#9ca3af",
  改善: "#ef4444",
};

const PRESETS: { label: string; lat: number; lng: number }[] = [
  { label: "捷運中山站", lat: 25.0526, lng: 121.5202 },
  { label: "板橋火車站", lat: 25.0136, lng: 121.4644 },
  { label: "逢甲夜市", lat: 24.1798, lng: 120.6464 },
  { label: "台南赤崁樓", lat: 22.997, lng: 120.2026 },
  { label: "高雄駁二", lat: 22.6204, lng: 120.2807 },
];

function parseRow(r: Record<string, unknown>): Toilet {
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    address: String(r.address ?? ""),
    city: String(r.city ?? ""),
    lat: Number(r.lat),
    lng: Number(r.lng),
    grade: String(r.grade ?? ""),
    accessible: r.accessible === true || r.accessible === "true",
    diaperStation: r.diaperStation === true || r.diaperStation === "true",
  };
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371.0088;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.3);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function ClickToSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function PublicToiletsDemo({ rows }: DemoProps) {
  const all = useMemo<Toilet[]>(() => rows.map(parseRow).filter((t) => !Number.isNaN(t.lat)), [rows]);

  const [center, setCenter] = useState<[number, number]>([25.0526, 121.5202]);
  const [radius, setRadius] = useState(1.0);
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  const matches = useMemo(() => {
    return all
      .map((t) => ({ ...t, distance: haversineKm(center, [t.lat, t.lng]) }))
      .filter((t) => t.distance <= radius && (!accessibleOnly || t.accessible))
      .sort((a, b) => {
        const ra = GRADE_RANK[a.grade] ?? 9;
        const rb = GRADE_RANK[b.grade] ?? 9;
        if (ra !== rb) return ra - rb;
        return a.distance - b.distance;
      });
  }, [all, center, radius, accessibleOnly]);

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-ink-500">快選位置：</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setCenter([p.lat, p.lng])}
              className="text-xs px-2 py-1 rounded-full border border-ink-200 hover:border-ink-400"
            >
              {p.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-ink-500 hidden sm:inline">點地圖任意位置可重設中心</span>
        </div>
        <div className="h-[28rem] rounded-lg overflow-hidden border border-ink-200">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            key={center.join(",")}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickToSet onPick={(la, ln) => setCenter([la, ln])} />
            <Circle
              center={center}
              radius={radius * 1000}
              pathOptions={{ color: "#3461d6", fillColor: "#3461d6", fillOpacity: 0.08 }}
            />
            <Marker position={center} icon={makeIcon("#1d2235")}>
              <Popup>查詢中心</Popup>
            </Marker>
            {matches.map((t) => (
              <Marker
                key={t.id}
                position={[t.lat, t.lng]}
                icon={makeIcon(GRADE_COLOR[t.grade] ?? "#888")}
              >
                <Popup>
                  <strong>{t.name}</strong>
                  <br />
                  {t.address}
                  <br />
                  評等：{t.grade}
                  <br />
                  距離 {(t.distance * 1000).toFixed(0)} m
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-ink-200 rounded-lg bg-white p-4">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1">
            搜尋半徑：{radius.toFixed(1)} km
          </label>
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full"
          />
          <label className="flex items-center gap-2 mt-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
            />
            只顯示有無障礙廁所的據點
          </label>
        </div>
        <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-2 border-b border-ink-100 text-xs text-ink-500">
            找到 <span className="text-ink-900 font-semibold tabular-nums">{matches.length}</span> 座（依評等排序，最多 8）
          </div>
          <ul className="divide-y divide-ink-100 max-h-72 overflow-y-auto">
            {matches.slice(0, 8).map((t) => (
              <li key={t.id} className="px-4 py-2.5 text-sm flex items-start gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: GRADE_COLOR[t.grade] ?? "#888" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-ink-900 truncate">{t.name}</span>
                    <span className="text-xs text-ink-400">[{t.grade}]</span>
                  </div>
                  <div className="text-xs text-ink-500 truncate">{t.address}</div>
                  <div className="text-xs text-ink-400 mt-0.5 flex gap-2">
                    <span>{(t.distance * 1000).toFixed(0)} m</span>
                    {t.accessible ? <span>♿</span> : null}
                    {t.diaperStation ? <span>👶</span> : null}
                  </div>
                </div>
              </li>
            ))}
            {matches.length === 0 ? (
              <li className="px-4 py-6 text-sm text-ink-400 text-center">半徑內沒有公廁</li>
            ) : null}
          </ul>
        </div>
        <div className="text-[11px] text-ink-400 leading-5">
          地圖底圖 © OpenStreetMap 貢獻者。資料為 demo 樣本（{all.length} 筆）。
        </div>
      </div>
    </div>
  );
}
