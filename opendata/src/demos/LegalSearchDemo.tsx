"use client";

import { useMemo, useState } from "react";
import type { DemoProps } from "./registry";

interface Article {
  law: string;
  article: number;
  source: string;
  text: string;
}

const ARTICLE_RE = /^第\s*(\d+)\s*條(?:[^\n]*)$/gm;

function extractArticles(filename: string, text: string): Article[] {
  const matches = [...text.matchAll(ARTICLE_RE)];
  if (matches.length === 0) return [];
  const head = text.slice(0, matches[0].index ?? 0).trim();
  const law = head.split(/\r?\n/)[0] || filename;
  const out: Article[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    out.push({
      law,
      article: Number(m[1]),
      source: filename,
      text: text.slice(start, end).trim(),
    });
  }
  return out;
}

function highlight(text: string, kw: string): React.ReactNode {
  if (!kw) return text;
  const parts = text.split(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "g"));
  return parts.map((p, i) =>
    p.toLowerCase() === kw.toLowerCase() ? (
      <mark key={i} className="bg-accent-100 text-accent-600 px-0.5 rounded">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default function LegalSearchDemo({ texts }: DemoProps) {
  const articles = useMemo(() => {
    const out: Article[] = [];
    for (const f of texts ?? []) {
      if (!f.path.endsWith(".txt")) continue;
      out.push(...extractArticles(f.path, f.content));
    }
    return out;
  }, [texts]);

  const [q, setQ] = useState("國家機密");

  const matched = useMemo(() => {
    if (!q.trim()) return [];
    const kw = q.trim();
    return articles.filter((a) => a.text.includes(kw));
  }, [articles, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="輸入關鍵字（例：國家機密、個人資料、申請）"
          className="flex-1 border border-ink-300 rounded-lg px-3 py-2 text-sm bg-white"
        />
        <span className="text-xs text-ink-500 shrink-0">
          {q.trim() ? `命中 ${matched.length} 條` : `共 ${articles.length} 條`}
        </span>
      </div>
      <div className="space-y-3 max-h-[32rem] overflow-y-auto">
        {(q.trim() ? matched : articles.slice(0, 5)).map((a) => (
          <article
            key={`${a.source}-${a.article}`}
            className="border border-ink-200 rounded-lg bg-white p-4"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="font-semibold text-ink-900">
                {a.law} 第 {a.article} 條
              </h4>
              <code className="text-[11px] text-ink-400 font-mono">{a.source}</code>
            </div>
            <pre className="text-sm text-ink-700 leading-7 whitespace-pre-wrap font-sans">
              {highlight(a.text, q.trim())}
            </pre>
          </article>
        ))}
        {q.trim() && matched.length === 0 ? (
          <div className="text-sm text-ink-400 py-12 text-center">
            找不到符合「{q}」的條文。
          </div>
        ) : null}
      </div>
    </div>
  );
}
