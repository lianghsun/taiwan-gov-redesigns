import Link from "next/link";

export const metadata = { title: "MCP" };

const TOOLS = [
  { name: "find_holiday", desc: "查 2026 年某日是否為政府機關放假日。", example: "2026 年 2 月 17 日是放假日嗎？" },
  { name: "nearest_toilets", desc: "輸入經緯度找半徑內公廁，依評等與距離排序。", example: "中山站附近 1.5 公里有哪幾個特優公廁？" },
  { name: "check_invoice", desc: "對統一發票（demo 為虛構號碼）。", example: "幫我對 115 年 01-02 期，發票號碼 49502718。" },
  { name: "aqi_at", desc: "查空氣品質測站某日小時值。", example: "沙鹿測站 4/28 PM2.5 走勢如何？" },
  { name: "search_tourism_spots", desc: "依縣市、類別、是否免費篩選觀光景點。", example: "花蓮縣有哪些免門票的自然類景點？" },
  { name: "search_legal_articles", desc: "在法規條文裡搜關鍵字，回完整條文。", example: "「個人資料」在哪幾條法規出現？" },
  { name: "query_population", desc: "查戶役政人口結構統計（年/縣市/年齡層）。", example: "2025 年新北市 65+ 人口是多少？" },
  { name: "decisions_in_meeting", desc: "抓出指定院會的決議事項。", example: "第 3792 次院會通過了哪些決議？" },
];

export default function McpPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="inline-block text-xs uppercase tracking-widest text-accent-600 font-semibold mb-2">
          Model Context Protocol
        </span>
        <h1 className="text-3xl font-bold text-ink-900 mb-3">用自然語言查台灣政府資料</h1>
        <p className="text-ink-500 leading-7 max-w-3xl">
          if·opendata 同時提供一個 <strong>MCP server</strong>（Model Context Protocol）。
          裝好後，你可以直接在 Claude Desktop（或任何 MCP 客戶端）用自然語言問問題，例如：
          <em className="text-ink-700"> 「中山站附近 1.5 公里內有哪幾個特優公廁？」</em>，
          模型會自動呼叫 <code>nearest_toilets</code> 工具去查資料、列出結果。
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-ink-900 mb-4">設定（Claude Desktop）</h2>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-ink-700 leading-7">
          <li>
            先 clone 或下載專案，進到 <code>opendata/mcp-server/</code>，跑：
            <pre className="bg-ink-900 text-ink-50 p-3 rounded-lg text-xs leading-6 overflow-x-auto mt-2">
              <code>{`cd opendata/mcp-server
npm install
npm run build`}</code>
            </pre>
          </li>
          <li>
            打開 Claude Desktop 的設定檔（macOS：
            <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>），
            加入以下 server entry（路徑換成你的本機路徑）：
            <pre className="bg-ink-900 text-ink-50 p-3 rounded-lg text-xs leading-6 overflow-x-auto mt-2">
              <code>{`{
  "mcpServers": {
    "if-opendata": {
      "command": "node",
      "args": [
        "/絕對路徑/到/if-series/opendata/mcp-server/dist/server.js"
      ]
    }
  }
}`}</code>
            </pre>
          </li>
          <li>重啟 Claude Desktop。新對話的工具列裡會看到 <code>if-opendata</code> 的 8 個 tools。</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-ink-900 mb-4">提供的工具</h2>
        <div className="border border-ink-200 rounded-lg bg-white overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {TOOLS.map((t) => (
              <li key={t.name} className="px-5 py-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <code className="font-mono text-sm font-semibold text-ink-900">{t.name}</code>
                </div>
                <p className="text-sm text-ink-600 leading-6 mb-1.5">{t.desc}</p>
                <p className="text-xs text-ink-500">
                  範例提問：
                  <span className="ml-1.5 italic">「{t.example}」</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-ink-900 mb-4">資源（Resources）</h2>
        <p className="text-sm text-ink-600 leading-7 mb-3">
          除了工具呼叫，所有資料集本身也以 MCP resource 形式 expose，模型可以「讀檔案」：
        </p>
        <ul className="list-disc pl-5 text-sm text-ink-700 leading-7">
          <li>
            <code>taiwan-data://datasets</code>：全部 dataset 索引
          </li>
          <li>
            <code>taiwan-data://datasets/{`{id}`}</code>：單一 dataset metadata
          </li>
          <li>
            <code>taiwan-data://datasets/{`{id}`}/files/{`{path}`}</code>：原始檔內容（CSV / JSONL / TXT / MD）
          </li>
        </ul>
      </section>

      <section className="border-t border-ink-200 pt-6 text-sm text-ink-500 leading-7">
        <h3 className="font-semibold text-ink-700 mb-1.5">為什麼這對政府開放資料是個重要的方向</h3>
        <p>
          MCP 是 LLM 與外部資料的標準通訊協議，正在快速變成 AI agent 取得資料的預設方式。
          現行 <code>data.gov.tw</code> 的 API（如有）每個資料集格式不同、無統一查詢語法、文件殘破——
          要讓 AI 助手「直接幫民眾查政府資料」幾乎不可能。
        </p>
        <p className="mt-2">
          如果政府平台一開始就以 MCP server 的形式提供資料，不管是 Claude、ChatGPT、Gemini，
          還是各種地端 LLM 應用，都能用同一份標準連上去。本站把這個假設做到了一個可以實際跑的 reference implementation。
        </p>
      </section>

      <div className="mt-10 flex gap-3">
        <Link href="/api" className="text-sm text-sovereign-500 hover:underline">
          → 看一般的 REST API 文件
        </Link>
        <Link href="/datasets" className="text-sm text-sovereign-500 hover:underline">
          → 瀏覽資料集
        </Link>
      </div>
    </div>
  );
}
