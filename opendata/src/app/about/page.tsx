import Link from "next/link";

export const metadata = { title: "關於本站" };

const PAINS = [
  {
    pain: "PDF 為主源",
    fix: "全站禁用 PDF 為主要格式，每個資料集都有 JSON / JSONL / CSV 至少一種。",
  },
  {
    pain: "欄位編碼與命名混亂",
    fix: "每個資料集都有明確 schema（欄位、型別、說明），命名統一駝峰或 snake。",
  },
  {
    pain: "沒有線上預覽",
    fix: "點進資料集即可看 100 列預覽，CSV / JSON / JSONL 都自動表格化。",
  },
  {
    pain: "沒有官方應用範例",
    fix: "每個資料集都附 1+ 個可執行範例，涵蓋 Python / JS / R / SQL / TS。",
  },
  {
    pain: "主權資料看不到「應該長什麼樣」",
    fix: "示範差分隱私、k-匿名抑制、聚合粒度三種隱私處理（資料皆為虛構示意）。",
  },
];

const NON_GOALS = [
  "這不是政府網站，不對應任何真實機關業務。",
  "標示「主權 · 示意」的資料完全是虛構的，請勿用於任何真實研究或對獎。",
  "不是要替政府寫網站，而是讓「應該怎麼做」這件事有個可指可點的參考點。",
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-white to-ink-50">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <span className="inline-block text-xs uppercase tracking-widest text-accent-600 font-semibold mb-3">
            About if·opendata
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 leading-tight">
            一個假設台灣 .gov 認真做資料平台會長什麼樣的 demo
          </h1>
          <p className="mt-5 text-lg text-ink-500 leading-8 max-w-3xl">
            本站是 <span className="font-semibold text-ink-900">if-series</span> 的第一站，把現行的{" "}
            <code className="font-mono text-ink-700">data.gov.tw</code> 與數位發展部主權資料合併重新想像，
            靈感取自 <span className="text-accent-600 font-semibold">HuggingFace</span> ×{" "}
            <span className="text-sovereign-500 font-semibold">GitHub</span>。
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-ink-900 mb-1">想解決哪些痛點</h2>
        <p className="text-ink-500 mb-6">逐項對照現行政府平台常被詬病的問題，與本 demo 的對策。</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {PAINS.map((p) => (
            <div
              key={p.pain}
              className="border border-ink-200 rounded-lg bg-white p-5 hover:border-ink-400 transition"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-rose-500 font-mono text-sm shrink-0">痛點</span>
                <h3 className="text-base font-semibold text-ink-900">{p.pain}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-600 font-mono text-sm shrink-0">對策</span>
                <p className="text-sm text-ink-500 leading-6">{p.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-ink-200">
        <h2 className="text-2xl font-semibold text-ink-900 mb-6">資料分類</h2>
        <p className="text-ink-500 mb-6">
          站上資料按性質分為兩大類，與發布機關無關。是不是「主權」資料只是元資料中的一個欄位，
          不該主導使用者的瀏覽動線——你關心的是「能不能直接用」「要不要做文本處理」。
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <article className="border border-sovereign-100 bg-sovereign-50/40 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-sovereign-100 bg-sovereign-50 text-sovereign-600 font-semibold">
                結構化
              </span>
              <h3 className="text-lg font-semibold text-ink-900">結構化資料</h3>
            </div>
            <p className="text-sm text-ink-600 leading-7">
              JSON / JSONL / CSV，附 schema 與表格化預覽。可直接進 ETL 管線、做分析、餵給機器學習模型。
              下游系統可信任型別，不必再寫一層 parser。
            </p>
            <Link
              href="/datasets?kind=structured"
              className="inline-block mt-4 text-sm font-semibold text-sovereign-500 hover:underline"
            >
              瀏覽結構化資料 →
            </Link>
          </article>
          <article className="border border-violet-100 bg-violet-50/40 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-violet-100 bg-violet-50 text-violet-600 font-semibold">
                非結構化
              </span>
              <h3 className="text-lg font-semibold text-ink-900">非結構化資料</h3>
            </div>
            <p className="text-sm text-ink-600 leading-7">
              法規條文、會議紀錄、敘述性文本。其結構藏在語言裡（章 / 條 / 項 / 款），
              適合 LLM 抽取、向量檢索、知識整理。原本是政府最常以 PDF 釋出的那類資料。
            </p>
            <Link
              href="/datasets?kind=unstructured"
              className="inline-block mt-4 text-sm font-semibold text-violet-600 hover:underline"
            >
              瀏覽非結構化資料 →
            </Link>
          </article>
        </div>
        <div className="mt-6 border border-rose-200 bg-rose-50 rounded-lg p-5 text-sm">
          <div className="font-semibold text-rose-700 mb-1">⚠ 關於「示意」資料</div>
          <p className="text-rose-700/80 leading-7">
            部分資料集標有「<strong>⚠ 示意</strong>」徽章與紅色橫幅，表示該內容完全虛構，
            常見於需要申請才能存取的主權資料。它們存在的目的是示範「應該怎麼揭露隱私處理」（差分隱私、k-匿名抑制等）的設計，
            不可用於任何真實研究、對獎或政策決策。
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-ink-200">
        <h2 className="text-2xl font-semibold text-ink-900 mb-6">這個站不是什麼</h2>
        <ul className="space-y-3">
          {NON_GOALS.map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span className="text-rose-500 mt-1 shrink-0" aria-hidden>
                ✕
              </span>
              <span className="text-ink-600 leading-7">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-ink-200">
        <h2 className="text-2xl font-semibold text-ink-900 mb-6">技術細節</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-ink-200 rounded-lg bg-white p-5">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">框架</div>
            <p className="text-ink-700">Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS</p>
          </div>
          <div className="border border-ink-200 rounded-lg bg-white p-5">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">資料層</div>
            <p className="text-ink-700">
              無資料庫，<code>data/</code> 目錄即真實來源；build 時靜態解析 meta.json 組成 registry。
            </p>
          </div>
          <div className="border border-ink-200 rounded-lg bg-white p-5">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">解析</div>
            <p className="text-ink-700">PapaParse（CSV）· 原生 JSON / JSONL · react-markdown + remark-gfm</p>
          </div>
          <div className="border border-ink-200 rounded-lg bg-white p-5">
            <div className="text-xs uppercase tracking-wider text-ink-400 mb-2">部署</div>
            <p className="text-ink-700">全站 SSG，可丟在任何靜態 host。</p>
          </div>
        </div>
      </section>
    </>
  );
}
