"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Meeting {
  path: string;
  title: string;
  decisions: string[];
}

function parseMeeting(path: string, md: string): Meeting {
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let cap = false;
  for (const l of lines) {
    const s = l.trim();
    if (s.startsWith("決議")) {
      cap = true;
      continue;
    }
    if (!cap) continue;
    if (s.startsWith("- ")) out.push(s.slice(2).trim());
    else if (s === "") continue;
    else if (s.startsWith("##") || s.startsWith("#")) cap = false;
  }
  return { path, title: titleMatch?.[1] ?? path, decisions: out };
}

export default function CabinetDecisionsDemo({ texts }: DemoProps) {
  const meetings = useMemo<Meeting[]>(() => {
    return (texts ?? [])
      .filter((f) => f.path.endsWith(".md") && !f.path.endsWith("README.md"))
      .map((f) => parseMeeting(f.path, f.content))
      .sort((a, b) => b.path.localeCompare(a.path));
  }, [texts]);

  const [idx, setIdx] = useState(0);
  const m = meetings[idx];

  return (
    <div className="grid lg:grid-cols-[20rem_1fr] gap-4">
      <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 py-2 border-b border-ink-100 text-xs uppercase tracking-wider text-ink-400">
          選擇院會
        </div>
        <ul className="divide-y divide-ink-100">
          {meetings.map((mt, i) => (
            <li key={mt.path}>
              <button
                type="button"
                onClick={() => setIdx(i)}
                className={
                  "w-full text-left px-4 py-3 transition " +
                  (i === idx ? "bg-sovereign-50 text-sovereign-600" : "hover:bg-ink-50")
                }
              >
                <div className="text-sm font-semibold">{mt.title}</div>
                <div className="text-xs text-ink-400 font-mono mt-0.5">{mt.path}</div>
                <div className="text-xs text-ink-500 mt-0.5">{mt.decisions.length} 條決議</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-ink-200 rounded-lg bg-white p-5">
        <h3 className="text-base font-semibold text-ink-900 mb-3">{m?.title ?? ""}</h3>
        {m && m.decisions.length > 0 ? (
          <ol className="space-y-3 list-decimal pl-5">
            {m.decisions.map((d, i) => (
              <li key={i} className="text-sm text-ink-700 leading-7">
                {d}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-ink-400 py-12 text-center">本次院會無決議事項。</div>
        )}
      </div>
    </div>
  );
}
