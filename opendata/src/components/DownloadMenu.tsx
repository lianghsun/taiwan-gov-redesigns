"use client";

import { useEffect, useRef, useState } from "react";
import type { DatasetFile } from "@/lib/types";

interface Props {
  org: string;
  id: string;
  files: DatasetFile[];
}

function formatBytes(b?: number): string {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadMenu({ org, id, files }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const downloadable = files.filter((f) => !f.path.startsWith("examples/"));
  if (downloadable.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 bg-ink-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-ink-700"
      >
        ⬇ 下載
        <span className="text-xs opacity-70">▾</span>
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-ink-200 rounded-lg shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-ink-400 border-b border-ink-100">
            原始檔
          </div>
          <ul className="divide-y divide-ink-100 max-h-72 overflow-y-auto">
            {downloadable.map((f) => (
              <li key={f.path}>
                <a
                  href={`/data/${org}/${id}/${f.path}`}
                  download
                  className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-ink-50"
                >
                  <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-ink-100 text-ink-500 shrink-0">
                    {f.format}
                  </span>
                  <span className="font-mono text-ink-900 truncate flex-1">
                    {f.path}
                  </span>
                  <span className="text-xs text-ink-400 tabular-nums shrink-0">
                    {formatBytes(f.size)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="px-3 py-2 text-[11px] text-ink-400 border-t border-ink-100">
            或用 API：<code className="font-mono text-ink-600">/api/datasets/{id}/data</code>
          </div>
        </div>
      ) : null}
    </div>
  );
}
