"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import type { DatasetMeta, Kind } from "@/lib/types";
import { DatasetCard } from "@/components/DatasetCard";

interface Props {
  items: DatasetMeta[];
}

const TABS: { key: Kind | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "structured", label: "結構化" },
  { key: "unstructured", label: "非結構化" },
];

export function DatasetsListClient({ items }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlKind = searchParams.get("kind");
  const urlQ = searchParams.get("q") ?? "";

  const kind: Kind | "all" =
    urlKind === "structured" || urlKind === "unstructured" ? urlKind : "all";
  const [q, setQ] = useState(urlQ);

  // 同步 URL 變化（例如使用者按上下頁）
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      structured: items.filter((d) => d.kind === "structured").length,
      unstructured: items.filter((d) => d.kind === "unstructured").length,
    } as const;
  }, [items]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((d) => {
      if (kind !== "all" && d.kind !== kind) return false;
      if (!kw) return true;
      return (
        d.title.toLowerCase().includes(kw) ||
        d.summary.toLowerCase().includes(kw) ||
        d.tags.some((t) => t.toLowerCase().includes(kw)) ||
        d.publisher.toLowerCase().includes(kw)
      );
    });
  }, [items, kind, q]);

  function go(nextKind: Kind | "all", nextQ: string) {
    const params = new URLSearchParams();
    if (nextKind !== "all") params.set("kind", nextKind);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    const qs = params.toString();
    router.replace(qs ? `/datasets?${qs}` : "/datasets", { scroll: false });
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 mb-1">資料集</h1>
          <p className="text-ink-500">瀏覽全部 {counts.all} 個資料集。</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(kind, q);
          }}
          className="flex gap-2"
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋名稱、摘要、發布單位或標籤"
            className="border border-ink-300 rounded-lg px-3 py-2 text-sm w-72 bg-white"
          />
          <button
            type="submit"
            className="bg-ink-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            搜尋
          </button>
        </form>
      </div>

      <div className="border-b border-ink-200 mb-6 flex gap-1">
        {TABS.map((t) => {
          const active = kind === t.key;
          const accent =
            t.key === "structured"
              ? "border-sovereign-500 text-sovereign-600"
              : t.key === "unstructured"
                ? "border-violet-500 text-violet-600"
                : "border-ink-900 text-ink-900";
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => go(t.key, q)}
              className={
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition cursor-pointer " +
                (active ? accent : "border-transparent text-ink-500 hover:text-ink-700")
              }
            >
              {t.label}
              <span className="ml-2 text-xs text-ink-400 tabular-nums">
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-ink-400 py-16 text-center">沒有符合條件的資料集。</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <DatasetCard key={d.id} ds={d} />
          ))}
        </div>
      )}
    </>
  );
}
