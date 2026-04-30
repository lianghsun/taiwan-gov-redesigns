import Link from "next/link";
import { Suspense } from "react";
import { listDatasets, listKinds } from "@/lib/datasets";
import { DatasetCard } from "@/components/DatasetCard";
import { HeaderSearch } from "@/components/HeaderSearch";

export default function HomePage() {
  const structured = listDatasets("structured");
  const unstructured = listDatasets("unstructured");
  const kinds = listKinds();

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-white to-ink-50">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-block text-xs uppercase tracking-widest text-accent-600 font-semibold mb-4">
              if-series · 第一站
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 leading-tight tracking-tight">
              如果台灣的政府資料平台
              <br />
              長得像 <span className="text-accent-500">HuggingFace</span> 加 <span className="text-sovereign-500">GitHub</span>
            </h1>
            <p className="mt-6 text-lg text-ink-500 leading-8">
              一個想像中的政府資料平台。每筆資料都附 README、欄位 schema、線上預覽、版本歷史與官方應用範例，
              且絕不以 PDF 為主要格式。資料按性質分為「結構化」與「非結構化」兩類，找得到、看得到、用得了。
            </p>
            <div className="mt-8">
              <Suspense fallback={null}>
                <HeaderSearch variant="hero" />
              </Suspense>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-500">
                <span>試試：</span>
                {["假日", "公廁", "空氣", "ETC", "法規", "院會"].map((s) => (
                  <Link
                    key={s}
                    href={`/datasets?q=${encodeURIComponent(s)}`}
                    className="px-2 py-0.5 rounded-full bg-white border border-ink-200 hover:border-ink-400"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/datasets"
                className="inline-flex items-center gap-2 bg-ink-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-ink-700"
              >
                瀏覽全部資料集 →
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-ink-300 text-ink-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white"
              >
                為什麼要做這個 demo
              </Link>
            </div>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 max-w-4xl">
            {kinds.map((k) => {
              const isStructured = k.kind === "structured";
              return (
                <Link
                  key={k.kind}
                  href={`/datasets?kind=${k.kind}`}
                  className={
                    "group relative block bg-white rounded-xl p-6 border-2 transition overflow-hidden " +
                    (isStructured
                      ? "border-sovereign-200 hover:border-sovereign-500 hover:shadow-[0_4px_24px_-8px_rgba(52,97,214,0.3)]"
                      : "border-violet-200 hover:border-violet-500 hover:shadow-[0_4px_24px_-8px_rgba(139,92,246,0.3)]")
                  }
                >
                  <div
                    className={
                      "absolute inset-x-0 top-0 h-1 " +
                      (isStructured ? "bg-sovereign-500" : "bg-violet-500")
                    }
                  />
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={
                        "w-12 h-12 rounded-lg flex items-center justify-center " +
                        (isStructured
                          ? "bg-sovereign-50 text-sovereign-500"
                          : "bg-violet-50 text-violet-500")
                      }
                      aria-hidden
                    >
                      {isStructured ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="8" y1="13" x2="16" y2="13" />
                          <line x1="8" y1="17" x2="16" y2="17" />
                          <line x1="8" y1="9" x2="10" y2="9" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={
                        "text-3xl font-bold tabular-nums " +
                        (isStructured ? "text-sovereign-500" : "text-violet-500")
                      }
                    >
                      {k.count}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-ink-900 mb-1">
                    {k.label}
                    <span className="ml-2 text-xs font-mono text-ink-400 font-normal">
                      {isStructured ? "structured" : "unstructured"}
                    </span>
                  </h2>
                  <p className="text-sm text-ink-500 leading-6 mb-3">{k.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(isStructured
                      ? ["CSV", "JSON", "JSONL"]
                      : ["TXT", "MD"]
                    ).map((f) => (
                      <span
                        key={f}
                        className={
                          "text-[10px] font-mono px-1.5 py-0.5 rounded " +
                          (isStructured
                            ? "bg-sovereign-50 text-sovereign-600"
                            : "bg-violet-50 text-violet-600")
                        }
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-200 bg-ink-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest text-accent-400 font-semibold mb-2">
                加值服務
              </span>
              <h2 className="text-2xl font-semibold">
                資料不是只能下載 — 直接接 API、給 LLM 用
              </h2>
              <p className="text-sm text-ink-300 mt-2 leading-6 max-w-2xl">
                每個資料集都同時提供 JSON REST API 與 MCP server，
                pipeline 可以零修改接入、AI 助理可以直接讀，不必下載 PDF 再貼進 prompt。
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/api"
              className="group block bg-ink-800 border border-ink-700 hover:border-accent-500 rounded-xl p-6 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-accent-500/10 text-accent-400 flex items-center justify-center" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-ink-400">REST · OpenAPI 3.1</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">JSON API</h3>
              <p className="text-sm text-ink-300 leading-6 mb-3">
                <code className="text-accent-400 font-mono text-xs">/api/datasets/[id]/data</code>
                ，支援 limit、offset、fields、format 切換。
                curl、pandas、fetch 都能直連，不必先下載檔案。
              </p>
              <span className="text-sm text-accent-400 group-hover:underline">查看 API 文件 →</span>
            </Link>

            <Link
              href="/mcp"
              className="group block bg-ink-800 border border-ink-700 hover:border-sovereign-400 rounded-xl p-6 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-sovereign-500/15 text-sovereign-300 flex items-center justify-center" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-ink-400">8 tools · stdio</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">MCP Server</h3>
              <p className="text-sm text-ink-300 leading-6 mb-3">
                Claude Desktop / Cursor 一行設定接入。可搜尋、列欄位、抽樣資料、跑統計，
                LLM 直接看見原始資料，不再被 PDF 截斷。
              </p>
              <span className="text-sm text-sovereign-300 group-hover:underline">設定教學 →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-6 border-l-4 border-sovereign-500 pl-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-sovereign-500 font-bold">
                Structured
              </span>
              <span className="text-[10px] text-ink-400">·</span>
              <span className="text-[10px] text-ink-400 font-mono">CSV / JSON / JSONL</span>
            </div>
            <h2 className="text-2xl font-semibold text-ink-900">結構化資料</h2>
            <p className="text-sm text-ink-500 mt-1">
              可直接進管線、做分析、餵給機器學習模型。每筆都附 schema 與表格化預覽。
            </p>
          </div>
          <Link href="/datasets?kind=structured" className="text-sm text-sovereign-500 hover:underline shrink-0">
            查看全部 →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {structured.map((d) => (
            <DatasetCard key={d.id} ds={d} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-ink-200">
        <div className="flex items-baseline justify-between mb-6 border-l-4 border-violet-500 pl-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-violet-500 font-bold">
                Unstructured
              </span>
              <span className="text-[10px] text-ink-400">·</span>
              <span className="text-[10px] text-ink-400 font-mono">TXT / MD</span>
            </div>
            <h2 className="text-2xl font-semibold text-ink-900">非結構化資料</h2>
            <p className="text-sm text-ink-500 mt-1">
              條文、紀錄、敘述性文本。適合 LLM 抽取、檢索、知識整理。
            </p>
          </div>
          <Link href="/datasets?kind=unstructured" className="text-sm text-violet-500 hover:underline shrink-0">
            查看全部 →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unstructured.map((d) => (
            <DatasetCard key={d.id} ds={d} />
          ))}
        </div>
      </section>
    </>
  );
}
